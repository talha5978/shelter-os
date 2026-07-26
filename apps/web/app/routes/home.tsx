import { Link } from "react-router";
import { ArrowRight, ShieldCheck, Stethoscope, Heart } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Card, CardContent } from "~/components/ui/card";

export default function HomeLanding() {
	return (
		<div className="bg-background text-foreground antialiased min-h-screen flex flex-col font-sans">
			<main className="grow">
				{/* Hero Section */}
				<section className="relative w-full min-h-[85vh] flex items-center pt-16 pb-24 overflow-hidden">
					<div className="absolute inset-0 z-0">
						<div
							className="bg-cover bg-center w-full h-full"
							style={{
								backgroundImage: "url(/hero_1.jpg)",
							}}
						/>
						<div className="absolute inset-0 bg-linear-to-r from-background via-background/50 to-transparent" />
					</div>

					<div className="relative z-10 w-full max-w-7xl mx-auto px-6">
						<div className="max-w-2xl">
							<Badge variant="secondary" className="mb-4 text-primary border-primary/20">
								Rescue. Rehabilitate. Rehome.
							</Badge>
							<h1 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground mb-6 leading-tight">
								Every animal deserves a second chance.
							</h1>
							<p className="text-base md:text-lg text-muted-foreground mb-8 max-w-xl leading-relaxed">
								Join our mission to provide loving homes, critical care, and lifelong
								compassion for animals in need. Your journey with a new best friend starts
								here.
							</p>
							<div className="flex flex-col sm:flex-row gap-4">
								<Button size="lg" className="group" asChild>
									<a href="#adopt">
										Adopt a Friend
										<ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
									</a>
								</Button>
								<Button size="lg" variant="secondary" asChild>
									<a href="#foster">Become a Foster</a>
								</Button>
							</div>
						</div>
					</div>
				</section>

				{/* Impact Stats */}
				<section
					className="w-full bg-card py-16 border-y border-border relative z-20 -mt-8"
					id="impact"
				>
					<div className="max-w-7xl mx-auto px-6">
						<div className="grid grid-cols-2 md:grid-cols-4 gap-6">
							<Card className="text-center bg-background border-border/50 shadow-sm transition-transform hover:-translate-y-1 duration-300">
								<CardContent className="p-6">
									<div className="text-3xl md:text-4xl font-bold text-primary mb-2">
										2,500+
									</div>
									<div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
										Animals Rescued
									</div>
								</CardContent>
							</Card>

							<Card className="text-center bg-background border-border/50 shadow-sm transition-transform hover:-translate-y-1 duration-300">
								<CardContent className="p-6">
									<div className="text-3xl md:text-4xl font-bold text-primary mb-2">
										1,800+
									</div>
									<div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
										Successful Adoptions
									</div>
								</CardContent>
							</Card>

							<Card className="text-center bg-background border-border/50 shadow-sm transition-transform hover:-translate-y-1 duration-300">
								<CardContent className="p-6">
									<div className="text-3xl md:text-4xl font-bold text-primary mb-2">
										120+
									</div>
									<div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
										Active Foster Homes
									</div>
								</CardContent>
							</Card>

							<Card className="text-center bg-background border-border/50 shadow-sm transition-transform hover:-translate-y-1 duration-300">
								<CardContent className="p-6">
									<div className="text-3xl md:text-4xl font-bold text-primary mb-2">15</div>
									<div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
										Years of Service
									</div>
								</CardContent>
							</Card>
						</div>
					</div>
				</section>

				{/* Success Stories */}
				<section className="w-full py-24 bg-muted/30" id="stories">
					<div className="max-w-7xl mx-auto px-6">
						<div className="text-center max-w-3xl mx-auto mb-16">
							<h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
								Heartwarming Success Stories
							</h2>
							<p className="text-muted-foreground">
								Every adoption is a victory. Read about the lives transformed through love and
								care.
							</p>
						</div>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
							{/* Story 1 */}
							<Link to="stories/max-new-begining" viewTransition prefetch="intent">
								<Card className="shadow-sm hover:bg-primary/5 transition-colors duration-300 cursor-pointer ease-in">
									<CardContent className="p-6 flex flex-col sm:flex-row gap-6 items-center">
										<div className="w-full sm:w-1/3 aspect-square bg-muted rounded-md overflow-hidden shrink-0">
											<img
												alt="Happy adopted dog with family"
												className="w-full h-full object-cover"
												src="/story_1_card.jpg"
											/>
										</div>
										<div className="w-full sm:w-2/3">
											<h3 className="text-xl font-semibold text-primary mb-2">
												Max's New Beginning
											</h3>
											<p className="text-sm text-muted-foreground mb-4 leading-relaxed">
												"After months in the shelter, Max finally found a family who
												understands his energetic spirit. He now spends his days
												hiking and cuddling on the couch."
											</p>
											<p className="text-xs font-semibold text-foreground">
												— The Johnson Family
											</p>
										</div>
									</CardContent>
								</Card>
							</Link>

							{/* Story 2 */}
							<Link to="stories/whiskers-quiet-haven" viewTransition prefetch="intent">
								<Card className="shadow-sm hover:bg-primary/5 transition-colors duration-300 cursor-pointer ease-in">
									<CardContent className="p-6 flex flex-col sm:flex-row gap-6 items-center">
										<div className="w-full sm:w-1/3 aspect-square bg-muted rounded-md overflow-hidden shrink-0">
											<img
												alt="Content cat resting indoors"
												className="w-full h-full object-cover"
												src="/story_2_card.jpg"
											/>
										</div>
										<div className="w-full sm:w-2/3">
											<h3 className="text-xl font-semibold text-primary mb-2">
												Whiskers' Quiet Haven
											</h3>
											<p className="text-sm text-muted-foreground mb-4 leading-relaxed">
												"A timid rescue cat who was afraid of her own shadow has
												blossomed into an affectionate companion in her quiet forever
												home."
											</p>
											<p className="text-xs font-semibold text-foreground">
												— Sarah M.
											</p>
										</div>
									</CardContent>
								</Card>
							</Link>

							<Link to="stories/olivers-golden-years" viewTransition prefetch="intent">
								{/* Story 3 */}
								<Card className="shadow-sm hover:bg-primary/5 transition-colors duration-300 cursor-pointer ease-in">
									<CardContent className="p-6 flex flex-col sm:flex-row gap-6 items-center">
										<div className="w-full sm:w-1/3 aspect-square bg-muted rounded-md overflow-hidden shrink-0">
											<img
												alt="Oliver's Golden Years"
												className="w-full h-full object-cover"
												src="/story_3_card.jpg"
											/>
										</div>
										<div className="w-full sm:w-2/3">
											<h3 className="text-xl font-semibold text-primary mb-2">
												Oliver's Golden Years
											</h3>
											<p className="text-sm text-muted-foreground mb-4 leading-relaxed">
												After 200 days in our care, Oliver found a family who loves
												his slow walks and gentle spirit.
											</p>
											<p className="text-xs font-semibold text-foreground">
												— The Martinez Family
											</p>
										</div>
									</CardContent>
								</Card>
							</Link>

							{/* Story 4 */}
							<Link to="stories/the-window-seat-duo" viewTransition prefetch="intent">
								<Card className="shadow-sm hover:bg-primary/5 transition-colors duration-300 cursor-pointer ease-in">
									<CardContent className="p-6 flex flex-col sm:flex-row gap-6 items-center">
										<div className="w-full sm:w-1/3 aspect-square bg-muted rounded-md overflow-hidden shrink-0">
											<img
												alt="The Window Seat Duo"
												className="w-full h-full object-cover"
												src="/story_4_card.jpg"
											/>
										</div>
										<div className="w-full sm:w-2/3">
											<h3 className="text-xl font-semibold text-primary mb-2">
												The Window Seat Duo
											</h3>
											<p className="text-sm text-muted-foreground mb-4 leading-relaxed">
												Pip and Squeak were found in a damp garden but now spend their
												days watching birds from a cozy window seat.
											</p>
											<p className="text-xs font-semibold text-foreground">
												— Sarah J.
											</p>
										</div>
									</CardContent>
								</Card>
							</Link>
						</div>
					</div>
				</section>

				{/* Our Mission / Excellence */}
				<section className="w-full py-24 bg-background" id="about">
					<div className="max-w-7xl mx-auto px-6">
						<div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
							<div>
								<Badge variant="secondary" className="mb-4 text-primary border-primary/20">
									Our Commitment
								</Badge>
								<h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
									Dedicated to Animal Welfare &amp; Community
								</h2>
								<p className="text-muted-foreground mb-8 leading-relaxed">
									At ShelterOS, we believe in a holistic approach to animal rescue. We
									aren't just a shelter; we are a community hub for education,
									rehabilitation, and compassionate care.
								</p>
								<ul className="space-y-6 mb-8">
									<li className="flex items-start gap-4">
										<ShieldCheck className="w-6 h-6 text-primary shrink-0 mt-0.5" />
										<div>
											<h4 className="font-semibold text-foreground mb-1">
												Unwavering Transparency
											</h4>
											<p className="text-sm text-muted-foreground leading-relaxed">
												Open door policies and clear communication about every
												animal's health, history, and behavioral needs.
											</p>
										</div>
									</li>
									<li className="flex items-start gap-4">
										<Stethoscope className="w-6 h-6 text-primary shrink-0 mt-0.5" />
										<div>
											<h4 className="font-semibold text-foreground mb-1">
												Comprehensive Medical Care
											</h4>
											<p className="text-sm text-muted-foreground leading-relaxed">
												State-of-the-art veterinary care, vaccinations, and
												rehabilitative services for all our rescues.
											</p>
										</div>
									</li>
									<li className="flex items-start gap-4">
										<Heart className="w-6 h-6 text-primary shrink-0 mt-0.5" />
										<div>
											<h4 className="font-semibold text-foreground mb-1">
												Community Support
											</h4>
											<p className="text-sm text-muted-foreground leading-relaxed">
												Ongoing behavioral support and educational resources for
												adopters to ensure lifelong success.
											</p>
										</div>
									</li>
								</ul>
								<Button variant="secondary" size="lg">
									Learn More About Us
								</Button>
							</div>

							<div className="grid grid-cols-2 gap-4">
								<div className="aspect-4/5 rounded-xl overflow-hidden bg-muted shadow-md">
									<img
										alt="Veterinary professional caring for a dog"
										className="w-full h-full object-cover"
										src="/commitment_1.jpg"
									/>
								</div>
								<div className="aspect-4/5 rounded-xl overflow-hidden bg-muted shadow-md mt-8">
									<img
										alt="Community volunteer interacting with animals"
										className="w-full h-full object-cover"
										src="/commitment_2.jpg"
									/>
								</div>
							</div>
						</div>
					</div>
				</section>
			</main>
		</div>
	);
}
