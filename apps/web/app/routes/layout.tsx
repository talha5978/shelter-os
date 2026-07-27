import { Heart, Home, LogOut, Menu, User, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, Outlet, useNavigate, useRouteLoaderData } from "react-router";
import { Button } from "~/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { createAuthApi } from "~/api/auth.api";
import { toast } from "sonner";
import type { loader } from "~/root";

export default function Layout() {
	const rootLoader = useRouteLoaderData<typeof loader>("root");
	const user = rootLoader?.user?.success ? rootLoader?.user?.data.user : null;

	const [isScrolled, setIsScrolled] = useState(false);
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

	useEffect(() => {
		const handleScroll = () => {
			if (window.scrollY > 20) {
				setIsScrolled(true);
			} else {
				setIsScrolled(false);
			}
		};
		window.addEventListener("scroll", handleScroll);
		return () => window.removeEventListener("scroll", handleScroll);
	}, []);

	const navigate = useNavigate();

	async function handleLogout() {
		const authApi = createAuthApi();
		await authApi.logout();
		toast.success("Logged out successfully");
		navigate("/", { replace: true, state: { from: window.location.pathname } });
	}

	return (
		<>
			<header
				id="main-header"
				className={`w-full sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border transition-all duration-300 ${
					isScrolled ? "shadow-md" : "shadow-sm"
				}`}
			>
				<div className="flex justify-between items-center h-20 px-6 max-w-7xl mx-auto">
					<Link to="/" viewTransition prefetch="intent">
						<div className="w-16 h-fit select-none">
							<img src="/logo.png" className="w-16 h-fit mix-blend-multiply" alt="Safe Haven" />
						</div>
					</Link>

					{/* Desktop Nav */}
					<nav className="hidden md:flex items-center gap-8">
						<Link
							to="/#adopt"
							className="text-sm font-semibold text-muted-foreground hover:text-primary transition-colors"
						>
							Adopt
						</Link>
						<Link
							to="/#foster"
							className="text-sm font-semibold text-muted-foreground hover:text-primary transition-colors"
						>
							Foster
						</Link>
						<Link
							to="/#about"
							className="text-sm font-semibold text-muted-foreground hover:text-primary transition-colors"
						>
							About
						</Link>
						<Link
							to="/#stories"
							className="text-sm font-semibold text-muted-foreground hover:text-primary transition-colors"
						>
							Stories
						</Link>
					</nav>

					<div className="flex items-center gap-4">
						<Link to="/donate" prefetch="intent" viewTransition>
							<Button className="hidden md:inline-flex" size="lg">
								Donate Now
							</Button>
						</Link>

						{/* User Avatar Dropdown */}
						{user && (
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button
										variant="ghost"
										className="relative h-10 w-10 rounded-full p-0 hover:bg-transparent"
									>
										<Avatar className="h-10 w-10 border border-border">
											<AvatarImage src="/avatar-placeholder.png" alt="User Profile" />
											<AvatarFallback className="bg-primary/10 text-primary font-bold">
												{user?.name.split(" ")[0][0]}
												{user?.name.split(" ")[1][0]}
											</AvatarFallback>
										</Avatar>
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent className="w-56" align="end" forceMount>
									<DropdownMenuLabel className="font-normal">
										<div className="flex flex-col space-y-1">
											<p className="text-sm font-medium leading-none">User Account</p>
											<p className="text-xs leading-none text-muted-foreground">
												{user?.email}
											</p>
										</div>
									</DropdownMenuLabel>
									<DropdownMenuSeparator />
									<DropdownMenuItem asChild className="cursor-pointer">
										<Link to="/account" className="flex items-center w-full">
											<User className="mr-2 h-4 w-4" />
											<span>My Account</span>
										</Link>
									</DropdownMenuItem>
									{user.role === "foster_volunteer" && (
										<DropdownMenuItem asChild className="cursor-pointer">
											<Link
												to="/animals/fosterable"
												className="flex items-center w-full"
											>
												<Home className="mr-2 h-4 w-4" />
												<span>Fosterable Animals</span>
											</Link>
										</DropdownMenuItem>
									)}
									{user.role === "adopter" && (
										<DropdownMenuItem asChild className="cursor-pointer">
											<Link
												to="/animals/adoptable"
												className="flex items-center w-full"
											>
												<Heart className="mr-2 h-4 w-4" />
												<span>Adoptable Animals</span>
											</Link>
										</DropdownMenuItem>
									)}
									<DropdownMenuSeparator />
									<DropdownMenuItem
										onClick={handleLogout}
										className="cursor-pointer"
										variant="destructive"
									>
										<LogOut className="mr-2 h-4 w-4" />
										<span>Sign Out</span>
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						)}

						{/* Mobile Toggle Button */}
						<Button
							variant="ghost"
							size="icon"
							onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
							className="md:hidden"
						>
							{mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
						</Button>
					</div>
				</div>

				{/* Mobile Navigation Drawer */}
				{mobileMenuOpen && (
					<div className="md:hidden border-t border-border bg-background px-6 py-4 space-y-3">
						<Link
							to="/#adopt"
							onClick={() => setMobileMenuOpen(false)}
							className="block text-sm font-medium text-foreground hover:text-primary"
						>
							Adopt
						</Link>
						<Link
							to="/#foster"
							onClick={() => setMobileMenuOpen(false)}
							className="block text-sm font-medium text-foreground hover:text-primary"
						>
							Foster
						</Link>
						<Link
							to="/#about"
							onClick={() => setMobileMenuOpen(false)}
							className="block text-sm font-medium text-foreground hover:text-primary"
						>
							About
						</Link>
						<Link
							to="/#stories"
							onClick={() => setMobileMenuOpen(false)}
							className="block text-sm font-medium text-foreground hover:text-primary"
						>
							Stories
						</Link>
						<Link to="/donate" onClick={() => setMobileMenuOpen(false)} className="block pt-2">
							<Button className="w-full" size="lg">
								Donate Now
							</Button>
						</Link>
					</div>
				)}
			</header>

			<Outlet />

			{/* Footer */}
			<footer className="w-full bg-card border-t border-border mt-auto">
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 px-6 py-16 max-w-7xl mx-auto">
					<div>
						<h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
							Safe Haven
						</h3>
						<p className="text-sm text-muted-foreground leading-relaxed">
							Compassion in every connection. We are dedicated to rescuing, rehabilitating, and
							rehoming animals in need.
						</p>
					</div>
					<div>
						<h4 className="font-semibold text-foreground mb-4">Links</h4>
						<ul className="space-y-3">
							<li>
								<a
									href="#"
									className="text-sm text-muted-foreground hover:underline hover:text-primary transition-colors"
								>
									Privacy Policy
								</a>
							</li>
							<li>
								<a
									href="#"
									className="text-sm text-muted-foreground hover:underline hover:text-primary transition-colors"
								>
									Terms of Service
								</a>
							</li>
						</ul>
					</div>
					<div>
						<h4 className="font-semibold text-foreground mb-4">Connect</h4>
						<ul className="space-y-3">
							<li>
								<a
									href="#"
									className="text-sm text-muted-foreground hover:underline hover:text-primary transition-colors"
								>
									Contact Us
								</a>
							</li>
							<li>
								<a
									href="#"
									className="text-sm text-muted-foreground hover:underline hover:text-primary transition-colors"
								>
									Careers
								</a>
							</li>
							<li>
								<a
									href="#"
									className="text-sm text-muted-foreground hover:underline hover:text-primary transition-colors"
								>
									Press Kit
								</a>
							</li>
						</ul>
					</div>
				</div>
				<div className="px-6 py-6 border-t border-border/50 max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
					<p className="text-sm text-muted-foreground">
						© {new Date().getFullYear()} Safe Haven. All rights reserved. Compassion in every
						connection.
					</p>
				</div>
			</footer>
		</>
	);
}
