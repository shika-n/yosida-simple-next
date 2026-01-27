import NavLink from "./clickables/navbar_link";

export default function Navbar() {
	return (
		<nav className="flex items-center bg-(--primary-3)">
			<NavLink to="/">Daily</NavLink>
			<NavLink to="/casual">Casual</NavLink>
			<NavLink to="/explore">Explore</NavLink>
		</nav>
	);
}
