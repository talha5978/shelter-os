import { Dog, Cake, Layers, Clock, Footprints, Quote } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Link } from "react-router";

export default function MaxStory() {
	return (
		<div className="bg-background text-foreground antialiased min-h-screen flex flex-col font-sans">
			{/* Main Content */}
			<main className="grow">
				{/* Hero Section */}
				<section className="relative w-full min-h-[60vh] flex items-center justify-center overflow-hidden bg-muted/30 border-b border-border">
					<div className="absolute inset-0 z-0 opacity-20">
						<img
							className="w-full h-full object-cover"
							src="https://lh3.googleusercontent.com/aida-public/AB6AXuAXKcY-QsVPrRov1h-YB6ABN_19M2xU3SCY3x85io0i0SzywZohRmD4_N7DOUex5UM41WIu-6QA4wZLDn02BTiTa8nHFp8eDhhSiERhs2O8KuWikRg2WwymsljGBvARIEaljp0EznMHxikk0H_NOu1zsswX9EW4B_17rj8jow9IoU8aVXM0zSImPcLUB1DlkN6QPw0uBesKUUxiVJ5_CxEyPB-5Pm3fCe41ZbfkNC0TNGmfiHWPf_dxtaA3h4G4QOJEnuTmkt5K8Io6"
							alt="Hero background texture"
						/>
					</div>
					<div className="relative z-10 text-center px-6 py-16 max-w-4xl mx-auto">
						<Badge
							variant="secondary"
							className="mb-4 inline-flex items-center gap-1.5 px-3 py-1 text-sm border border-primary/20 bg-background/80 backdrop-blur-sm"
						>
							<Dog className="w-4 h-4 text-primary" />
							<span className="text-primary font-medium">Success Story</span>
						</Badge>
						<h1 className="text-3xl md:text-5xl font-bold text-foreground mb-3 leading-tight">
							Max's New Beginning
						</h1>
						<p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
							An energetic spirit finds his perfect match for outdoor adventures.
						</p>
					</div>
				</section>

				{/* Content Area */}
				<section className="py-16 px-6 max-w-7xl mx-auto">
					<div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
						{/* Main Narrative */}
						<div className="lg:col-span-8 space-y-8">
							<Card className="shadow-sm">
								<CardHeader>
									<CardTitle className="text-2xl md:text-3xl font-bold text-foreground">
										The Rescue
									</CardTitle>
								</CardHeader>
								<CardContent className="space-y-4 text-muted-foreground leading-relaxed">
									<p>
										When Max first arrived at Safe Haven, his energy was undeniable. A
										golden retriever mix with endless stamina, he spent his first few
										weeks pacing the enclosure, eager for engagement. The staff quickly
										realized that Max wasn't just an active dog; he needed a job, a
										purpose, and most importantly, a family that could match his boundless
										enthusiasm for the great outdoors.
									</p>
									<p>
										He required structured exercise and mental stimulation. Standard walks
										weren't enough. We knew finding the right fit would be crucial—a
										family that viewed a rigorous hike not as a chore, but as a weekend
										necessity.
									</p>
								</CardContent>
							</Card>

							{/* Story Image */}
							<div className="relative rounded-xl overflow-hidden border border-border shadow-sm aspect-video">
								<img
									className="w-full h-full object-cover"
									src="https://lh3.googleusercontent.com/aida-public/AB6AXuDPteNm-fpAx5ZRG3gFw4d_BeHThl7d9BRwZv0dFoig1G7QCsJdk1jBP5u_vOslyH_xlPEcPs7dD8uxtrdQQcT73GZ-LH0pVsgyWa54tNaSxNYSJWNaST5dxpw47zu_b7KqYl5J7oDIpnh3DbyKNBflPNvsiuDbUfXxDF79y4axoqAZYQWOFqqshgQNTfZwDiNKeVOPuqePcUar4C02PmMOAXHf95f1q6jTjoOv-VfUc4JZzrfRtPtRnfSMAjx7jYsxU40s85sf6zAg"
									alt="A scruffy, happy golden retriever mix playing fetch in a sunlit green park with a young family."
								/>
							</div>

							<Card className="shadow-sm">
								<CardHeader>
									<CardTitle className="text-2xl md:text-3xl font-bold text-foreground">
										Finding the Johnsons
									</CardTitle>
								</CardHeader>
								<CardContent className="space-y-4 text-muted-foreground leading-relaxed">
									<p>
										Enter the Johnson family. Avid hikers and weekend campers, they
										visited Safe Haven looking for a companion to join their outdoor
										excursions. During their initial meet-and-greet in our open play area,
										the connection was instantaneous.
									</p>
									<p>
										A simple game of fetch turned into a half-hour bonding session. Max
										responded intuitively to their commands, and the Johnsons were
										delighted by his intelligence and agility. It wasn't just an adoption;
										it was the forming of an adventure team. By the end of the day, Max
										was riding shotgun in their SUV, headed toward his new life.
									</p>
								</CardContent>
							</Card>

							{/* Testimonial Quote */}
							<div className="bg-primary/10 rounded-xl border border-primary/20 p-8 relative overflow-hidden">
								<Quote className="w-28 h-28 text-primary/10 absolute -top-4 -left-4 pointer-events-none" />
								<div className="relative z-10">
									<p className="text-xl md:text-2xl font-serif italic text-foreground mb-4 leading-snug">
										"Max has brought so much joy and movement to our lives. He's not just
										a pet; he's our hiking partner and our best friend."
									</p>
									<p className="text-sm font-bold text-primary">— The Johnson Family</p>
								</div>
							</div>
						</div>

						{/* Sidebar Profile & CTA */}
						<aside className="lg:col-span-4 space-y-6 sticky top-28">
							<Card className="shadow-sm">
								<CardHeader className="bg-muted/50 border-b border-border py-4">
									<CardTitle className="text-xl font-bold text-foreground flex items-center gap-2">
										<Dog className="w-5 h-5 text-primary" />
										Max's Profile
									</CardTitle>
								</CardHeader>
								<CardContent className="pt-4">
									<ul className="space-y-3">
										<li className="flex justify-between items-center py-1 border-b border-border/50 last:border-0">
											<span className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5 uppercase">
												<Cake className="w-4 h-4 text-muted-foreground" />
												Age
											</span>
											<span className="text-sm font-medium text-foreground">
												2 Years
											</span>
										</li>
										<li className="flex justify-between items-center py-1 border-b border-border/50 last:border-0">
											<span className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5 uppercase">
												<Layers className="w-4 h-4 text-muted-foreground" />
												Breed
											</span>
											<span className="text-sm font-medium text-foreground">
												Golden Retriever Mix
											</span>
										</li>
										<li className="flex justify-between items-center py-1 border-b border-border/50 last:border-0">
											<span className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5 uppercase">
												<Clock className="w-4 h-4 text-muted-foreground" />
												Time in Shelter
											</span>
											<span className="text-sm font-medium text-foreground">
												45 Days
											</span>
										</li>
										<li className="flex justify-between items-center py-1 border-b border-border/50 last:border-0">
											<span className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5 uppercase">
												<Footprints className="w-4 h-4 text-muted-foreground" />
												Favorite Activity
											</span>
											<span className="text-sm font-medium text-foreground">
												Hiking
											</span>
										</li>
									</ul>
								</CardContent>
							</Card>

							{/* Action Card */}
							<Card className="bg-muted/30 shadow-sm border-border">
								<CardHeader className="text-center pb-2">
									<CardTitle className="text-xl font-bold text-foreground">
										Help More Dogs Like Max
									</CardTitle>
								</CardHeader>
								<CardContent className="text-center space-y-4">
									<p className="text-xs text-muted-foreground leading-relaxed">
										Your support allows us to provide care and find perfect homes for dogs
										in need.
									</p>
									<div className="flex flex-col gap-2">
										<Link to="/donate" viewTransition prefetch="intent">
											<Button className="w-full" size="default">
												Sponsor a Dog
											</Button>
										</Link>
										<Link to="/sign-up?isFoster=true" viewTransition prefetch="intent">
											<Button className="w-full" variant="outline" size="default">
												Become a Foster Partner
											</Button>
										</Link>
									</div>
								</CardContent>
							</Card>
						</aside>
					</div>
				</section>
			</main>
		</div>
	);
}
