import { Heart, Leaf, Quote, Lightbulb, CheckCircle, Cat } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

export default function WindowSeatDuoStory() {
	return (
		<div className="bg-background text-foreground font-sans antialiased selection:bg-primary/20 selection:text-primary min-h-screen flex flex-col">
			{/* Main Content Area */}
			<main className="max-w-7xl mx-auto px-6 py-16 grow w-full">
				{/* Hero Section */}
				<article className="flex flex-col gap-8 mb-16">
					<header className="text-center max-w-3xl mx-auto space-y-3">
						<Badge
							variant="secondary"
							className="px-3 py-1 text-xs uppercase tracking-wider bg-muted border border-border text-muted-foreground"
						>
							Success Story
						</Badge>
						<h1 className="text-3xl md:text-5xl font-bold text-foreground leading-tight">
							The Window Seat Duo
						</h1>
						<p className="text-lg text-muted-foreground max-w-2xl mx-auto">
							Pip and Squeak's journey from a damp garden to a life of cozy bird-watching.
						</p>
					</header>

					<div className="w-full aspect-[21/9] md:aspect-[2.5/1] rounded-xl overflow-hidden shadow-sm border border-border">
						<img
							alt="Pip and Squeak looking out a window"
							className="w-full h-full object-cover object-center"
							src="https://lh3.googleusercontent.com/aida-public/AB6AXuBgC5q4ddHXQqSioWvb819oEHT9e8JsheoIPwhJdjLhHAzceVpEY7E0z9OIqK1WXo6yrMqwGPwo9kllHPFYkV4MDCz1aR8p2rR1yg2mWshXIK0ZGmOvai9doLuB19Uc9OLOE3DfClkR1jr1aMg0ndbmki2_5KihM5ghUijU9CoVOhganzlxylxXk4xaxbsSLo7i3F7NV4uRJ3pMcWlXX2u0YIjUg2ywvs-Dz424Wq8aCJMF-8XRtV7TuWkPPv0GF_V0Zbn5Wjd2ehE5"
						/>
					</div>
				</article>

				{/* Content Layout Grid */}
				<div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
					{/* Main Content */}
					<div className="md:col-span-8 space-y-12">
						{/* Story Section */}
						<Card className="shadow-sm">
							<CardHeader className="pb-2">
								<CardTitle className="text-2xl md:text-3xl font-bold text-foreground border-b border-border pb-3">
									Their Story
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4 text-muted-foreground leading-relaxed pt-2">
								<p>
									It was a cold, rainy morning in early April when a local gardener heard
									tiny, persistent mews coming from beneath a dense patch of rhododendrons.
									There, huddled together for warmth, were two incredibly small kittens, no
									more than four weeks old. One was a striking tuxedo (Pip), the other a
									pale orange tabby (Squeak). They were cold, hungry, and utterly dependent
									on one another.
								</p>
								<p>
									Upon arrival at Haven Shelter, it became immediately clear that these two
									were inseparable. If placed in separate holding areas for even a moment
									during their medical intake, they would cry inconsolably. We knew from day
									one that they had to be adopted together.
								</p>
							</CardContent>
						</Card>

						{/* The Bond Section */}
						<div className="space-y-4">
							<h2 className="text-2xl md:text-3xl font-bold text-foreground border-b border-border pb-3">
								The Bond
							</h2>
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
								<Card className="shadow-sm border-border">
									<CardHeader className="pb-2">
										<Heart className="w-8 h-8 text-primary mb-1" />
										<CardTitle className="text-xl font-bold text-foreground">
											Inseparable Play
										</CardTitle>
									</CardHeader>
									<CardContent>
										<p className="text-sm text-muted-foreground leading-relaxed">
											Whether it's chasing laser pointers or wrestling with toy mice,
											Pip and Squeak do everything as a team, ensuring they both get
											plenty of exercise and socialization.
										</p>
									</CardContent>
								</Card>

								<Card className="shadow-sm border-border">
									<CardHeader className="pb-2">
										<Leaf className="w-8 h-8 text-primary mb-1" />
										<CardTitle className="text-xl font-bold text-foreground">
											Comfort in Pairs
										</CardTitle>
									</CardHeader>
									<CardContent>
										<p className="text-sm text-muted-foreground leading-relaxed">
											Adapting to a new home can be stressful for a kitten. Having a
											bonded sibling provides constant reassurance and drastically
											reduces anxiety.
										</p>
									</CardContent>
								</Card>
							</div>
						</div>

						{/* Featured Quote Block */}
						<div className="p-8 bg-muted/40 rounded-xl border-l-4 border-primary relative overflow-hidden">
							<Quote className="w-28 h-28 text-primary/10 absolute -top-4 -left-4 pointer-events-none" />
							<div className="relative z-10">
								<p className="text-lg md:text-xl font-serif italic text-foreground leading-relaxed">
									"I initially only planned to adopt one cat, but seeing how closely bonded
									they were at the shelter changed my mind completely. It was the best
									decision I could have made. They entertain each other, comfort each other,
									and watching them cuddle in the window seat is the highlight of my day."
								</p>
								<footer className="mt-4 text-xs font-bold text-foreground uppercase tracking-wide">
									— Sarah J., Adopter
								</footer>
							</div>
						</div>
					</div>

					{/* Sidebar */}
					<aside className="md:col-span-4 space-y-6 sticky top-28">
						{/* Advice Card */}
						<Card className="shadow-sm border-border">
							<CardHeader className="pb-3">
								<CardTitle className="text-lg font-bold text-foreground flex items-center gap-2">
									<Lightbulb className="w-5 h-5 text-primary" />
									Advice for Adopting Pairs
								</CardTitle>
							</CardHeader>
							<CardContent>
								<ul className="space-y-4 text-xs text-muted-foreground leading-relaxed">
									<li className="flex items-start gap-2.5 pb-3 border-b border-border/50">
										<CheckCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
										<span>
											<strong>Double the supplies:</strong> Ensure you have two litter
											boxes (plus one extra), separate food bowls, and ample resting
											spots.
										</span>
									</li>
									<li className="flex items-start gap-2.5 pb-3 border-b border-border/50">
										<CheckCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
										<span>
											<strong>Less destructive behavior:</strong> Bonded pairs often
											keep each other entertained, which can lead to less scratched
											furniture.
										</span>
									</li>
									<li className="flex items-start gap-2.5">
										<CheckCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
										<span>
											<strong>Easier transition:</strong> They provide emotional support
											to one another when moving into a new, unfamiliar environment.
										</span>
									</li>
								</ul>
							</CardContent>
						</Card>

						{/* Call to Action */}
						<Card className="bg-muted/30 border-primary/50 text-center shadow-sm">
							<CardHeader className="items-center pb-2">
								<Cat className="w-10 h-10 text-primary mb-1" />
								<CardTitle className="text-xl font-bold text-foreground">
									Find Your Duo
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<p className="text-xs text-muted-foreground leading-relaxed">
									We currently have several bonded pairs waiting for a loving home.
								</p>
								<Button className="w-full" size="default">
									Become an Adopter
								</Button>
							</CardContent>
						</Card>
					</aside>
				</div>
			</main>
		</div>
	);
}
