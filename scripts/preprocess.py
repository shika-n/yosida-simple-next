#!/usr/bin/env python

import xml.etree.ElementTree as et
import sqlite3 as sql


class Word:
    kanji = None
    reading = None


def is_noun(sense):
    pos = sense.find("pos")
    if pos is None or not pos.text.endswith("(futsuumeishi)"):
        return False

    return True


def is_common(entry):
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
            reading VARCHAR(5) NOT NULL
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
        sense = entry.find("sense")
        if sense is None:
            continue

        if not is_noun(sense):
            continue

        if not is_common(entry):
            continue

        word = get_word_if_len(entry, 5)
        if word is None:
            continue

        glossaries = get_glossaries(sense)
        if glossaries is None:
            continue

        res = cur.execute(
            "INSERT INTO words (kanji, reading) VALUES (?, ?)",
            [word.kanji, word.reading]
        )
        word_id = cur.lastrowid

        for glossary in glossaries:
            cur.execute(
                "INSERT INTO glossaries (word_id, meaning) VALUES (?, ?)",
                [word_id, glossary]
            )

    res = cur.execute("SELECT COUNT(id) FROM words")
    print("Database created. {} entries".format(res.fetchall()[0][0]))
