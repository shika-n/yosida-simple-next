import NavLink from "./clickables/navbar_link";

export default function Navbar() {
	return (
		<nav className="flex items-center bg-(--primary-3)">
			<NavLink to="/">Home</NavLink>
			<NavLink to="/explore">Explore</NavLink>
		</nav>
	);
}
