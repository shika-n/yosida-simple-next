#!/usr/bin/env python

import xml.etree.ElementTree as et
import sqlite3 as sql


acceptable_pos = [
    "adjective (keiyoushi)",
    "adjective (keiyoushi) - yoi/ii class",
    "adjectival nouns or quasi-adjectives (keiyodoshi)",
    "nouns which may take the genitive case particle 'no'",
    "pre-noun adjectival (rentaishi)",
    "noun (common) (futsuumeishi)",
]


class Word:
    kanji = None
    reading = None


def is_pos_acceptable(sense):
    pos = sense.findall("pos")
    if len(pos) == 0:
        return False

    for p in pos:
        return p.text in acceptable_pos

    return True


def is_common_word(entry):
    k_ele = entry.find("k_ele")
    if k_ele is None:
        return False

    ke_pris = k_ele.findall("ke_pri")
    if len(ke_pris) == 0:
        return False

    for ke_pri in ke_pris:
        if ke_pri.text in ["news1", "news2", "ichi1", "ichi2"]:
            return True

    return False


# Only fetch the first kanji and reading entry
def get_word_if_len(entry, length) -> Word:
    r_ele = entry.find("r_ele")
    if r_ele is None:
        return None

    reb = r_ele.find("reb")
    if reb is None or len(reb.text) != length:
        return None

    k_ele = entry.find("k_ele")
    if k_ele is None:
        return None

    keb = k_ele.find("keb")
    if keb is None:
        return None

    word = Word()
    word.kanji = keb.text
    word.reading = reb.text

    return word


def get_glossaries(sense):
    glossaries = sense.findall("gloss")
    if len(glossaries) == 0:
        return None

    return [glossary.text for glossary in glossaries]


filename = "tmp/JMdict_e.xml"

print("Parsing...")
xml_tree = et.parse(filename)
print("Parsing done")

with sql.connect("dict.db") as db:
    print("Creating database")
    cur = db.cursor()
    cur.execute("""
        CREATE TABLE words (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            kanji VARCHAR(5) NOT NULL,
            reading VARCHAR(5) NOT NULL,
            is_common BOOLEAN NOT NULL
        )
    """)
    cur.execute("""
        CREATE TABLE glossaries (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            word_id INTEGER NOT NULL REFERENCES words(id),
            meaning VARCHAR(100) NOT NULL
        )
    """)

    root = xml_tree.getroot()
    for entry in root:
        senses = entry.findall("sense")
        if len(senses) == 0:
            continue

        sense = None
        for s in senses:
            if not is_pos_acceptable(s):
                continue
            sense = s

        if sense is None:
            continue

        is_common = is_common_word(entry)

        word = get_word_if_len(entry, 5)
        if word is None:
            continue

        glossaries = get_glossaries(sense)
        if glossaries is None:
            continue

        res = cur.execute(
            "INSERT INTO words (kanji, reading, is_common) VALUES (?, ?, ?)",
            [word.kanji, word.reading, is_common]
        )
        word_id = cur.lastrowid

        for glossary in glossaries:
            cur.execute(
                "INSERT INTO glossaries (word_id, meaning) VALUES (?, ?)",
                [word_id, glossary]
            )

    total_count = cur.execute("SELECT COUNT(id) FROM words").fetchall()[0][0]
    common_count = cur.execute(
        "SELECT COUNT(id) FROM words WHERE is_common = TRUE").fetchall()[0][0]
    print("Database created. {} entries. {} entries are common.".format(
        total_count, common_count))
