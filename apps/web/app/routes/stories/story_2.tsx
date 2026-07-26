import { Calendar, Cat, Hourglass, Feather } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Link } from "react-router";

export default function WhiskersStory() {
	return (
		<div className="bg-background text-foreground antialiased min-h-screen flex flex-col font-sans">
			{/* Main Content */}
			<main className="grow">
				{/* Hero Section */}
				<section className="relative w-full h-[60vh] min-h-[400px] flex items-end pb-16">
					<div className="absolute inset-0 z-0">
						<img
							alt="Whiskers resting peacefully in a sunlit room"
							className="w-full h-full object-cover"
							src="https://lh3.googleusercontent.com/aida-public/AB6AXuACna3Qzd_ecvQQ5pcgZOieK46YQzdfH_yc7gI6N1C6mj97hcJEXrw21pBsAscBkCvJxjfj9eceSmR9r3vDAcqIn9rKvtU_3yocpljLkwsXDxnXjpdWpewJUMU6RqJ-DCaqCmHdO6pV_PA-9Dy7WbK9FpXbzQJCgh1lsPDwKdv5yYVzDZzHvsMOmiwXYR0s3qmllJsdr7XBv4XcQw4FD5zFd041FT8__ytfJ4i3Bz4Bmb2m5NZ0doXGh7iZfrck9QJiNHYHGUWwWhao"
						/>
						<div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
					</div>
					<div className="relative z-10 max-w-7xl mx-auto px-6 w-full">
						<div className="max-w-2xl">
							<Badge variant="secondary" className="mb-4 text-primary border-primary/20">
								Success Story
							</Badge>
							<h1 className="text-3xl md:text-5xl font-bold text-foreground mb-3 leading-tight">
								Whiskers' Quiet Haven
							</h1>
							<p className="text-lg md:text-xl text-muted-foreground mb-6">
								A timid rescue cat blossoms into an affectionate companion.
							</p>
						</div>
					</div>
				</section>

				{/* Content Grid */}
				<section className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 lg:grid-cols-12 gap-12">
					{/* Main Narrative */}
					<div className="lg:col-span-8 space-y-8">
						<article className="prose prose-stone max-w-none">
							<h2 className="text-2xl md:text-3xl font-bold text-primary mb-4">A Slow Start</h2>
							<p className="text-base text-foreground mb-6 leading-relaxed">
								When Whiskers first arrived at Safe Haven, he was a shadow of the cat he is
								today. Found wandering a busy industrial park, the hustle and noise had
								clearly taken a toll on him. During his first few weeks with us, he spent most
								of his time hiding in the quietest, darkest corner of his enclosure, wide-eyed
								and fearful of any sudden movements or loud sounds.
							</p>

							<blockquote className="my-8 p-6 border-l-4 border-primary bg-card rounded-r-lg shadow-sm border border-border/50">
								<p className="text-lg text-foreground italic mb-3">
									"Seeing Whiskers finally come out of his shell and curl up next to me was
									the most rewarding moment. He just needed someone to believe in him."
								</p>
								<p className="text-sm text-muted-foreground font-semibold">
									— Sarah M., Adopter
								</p>
							</blockquote>

							<h2 className="text-2xl md:text-3xl font-bold text-primary mb-4 mt-8">
								The Perfect Match
							</h2>
							<p className="text-base text-foreground leading-relaxed mb-4">
								Sarah M. visited the shelter specifically looking for a companion who needed a
								quiet, patient home. While other visitors gravitated toward the outgoing
								kittens pressing against the glass, Sarah noticed Whiskers tucked away in his
								corner. She looked past his timid nature and saw his gentle spirit.
							</p>
							<p className="text-base text-foreground leading-relaxed">
								Sarah committed to visiting him several times before taking him home, sitting
								quietly outside his space and reading a book. By her third visit, Whiskers
								ventured out for a tentative sniff. Once home, Sarah gave him the time and
								space he needed to feel safe, setting up a cozy "safe room" until he felt
								ready to explore. Today, he is an entirely different cat, greeting her at the
								door and insisting on evening cuddle sessions on the sofa.
							</p>
						</article>
					</div>

					{/* Sidebar */}
					<aside className="lg:col-span-4">
						<Card className="sticky top-28 shadow-sm">
							<CardHeader className="pb-3 border-b border-border">
								<CardTitle className="text-xl font-bold text-foreground">
									Whiskers' Profile
								</CardTitle>
							</CardHeader>
							<CardContent className="pt-4">
								<ul className="space-y-4">
									<li className="flex items-center gap-3 py-1 border-b border-border/50 last:border-0">
										<Calendar className="w-5 h-5 text-muted-foreground shrink-0" />
										<div className="flex flex-col">
											<span className="text-xs font-semibold text-muted-foreground uppercase">
												Age
											</span>
											<span className="text-sm font-medium text-foreground">
												4 Years
											</span>
										</div>
									</li>
									<li className="flex items-center gap-3 py-1 border-b border-border/50 last:border-0">
										<Cat className="w-5 h-5 text-muted-foreground shrink-0" />
										<div className="flex flex-col">
											<span className="text-xs font-semibold text-muted-foreground uppercase">
												Breed
											</span>
											<span className="text-sm font-medium text-foreground">
												Grey Tabby
											</span>
										</div>
									</li>
									<li className="flex items-center gap-3 py-1 border-b border-border/50 last:border-0">
										<Hourglass className="w-5 h-5 text-muted-foreground shrink-0" />
										<div className="flex flex-col">
											<span className="text-xs font-semibold text-muted-foreground uppercase">
												Time in Shelter
											</span>
											<span className="text-sm font-medium text-foreground">
												120 Days
											</span>
										</div>
									</li>
									<li className="flex items-center gap-3 py-1 border-b border-border/50 last:border-0">
										<Feather className="w-5 h-5 text-muted-foreground shrink-0" />
										<div className="flex flex-col">
											<span className="text-xs font-semibold text-muted-foreground uppercase">
												Favorite Activity
											</span>
											<span className="text-sm font-medium text-foreground">
												Bird Watching
											</span>
										</div>
									</li>
								</ul>
							</CardContent>
						</Card>
					</aside>
				</section>

				{/* Bottom CTA Section */}
				<section className="bg-muted/40 border-t border-border py-16">
					<div className="max-w-3xl mx-auto px-6 text-center">
						<h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
							Support More Cats Like Whiskers
						</h2>
						<p className="text-muted-foreground mb-8 leading-relaxed">
							Your support helps us provide the patience, care, and safe environment needed for
							timid animals to thrive.
						</p>
						<div className="flex flex-col sm:flex-row justify-center gap-4">
							<Link to="/donate" viewTransition prefetch="intent">
								<Button size="lg">Sponsor a Cat</Button>
							</Link>
							<Button size="lg" variant="outline">
								Become a Foster Parent
							</Button>
						</div>
					</div>
				</section>
			</main>
		</div>
	);
}
