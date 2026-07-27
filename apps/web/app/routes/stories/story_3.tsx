import { Heart, Cake, Dog, Timer, Sun, Quote, Milestone, Home } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Link } from "react-router";

export default function OliverStory() {
	return (
		<div className="bg-background text-foreground antialiased min-h-screen flex flex-col font-sans selection:bg-primary selection:text-primary-foreground">
			{/* Main Content Container */}
			<main className="max-w-7xl mx-auto px-6 py-16 w-full grow">
				{/* Hero Section */}
				<header className="mb-16 flex flex-col items-center text-center">
					<Badge
						variant="secondary"
						className="mb-4 inline-flex items-center gap-1.5 px-3 py-1 text-sm border border-primary/20 bg-muted"
					>
						<Heart className="w-4 h-4 text-primary fill-primary" />
						<span className="text-muted-foreground font-medium">Success Story</span>
					</Badge>

					<h1 className="text-3xl md:text-5xl font-bold text-foreground mb-3 leading-tight">
						Oliver's Golden Years
					</h1>
					<p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl">
						A senior Labrador finds his forever home after 200 days waiting.
					</p>

					<div className="w-full h-[50vh] min-h-100 rounded-xl overflow-hidden shadow-sm border border-border relative">
						<img
							alt="Oliver the senior Labrador with his new family"
							className="w-full h-full object-cover"
							src="/olivers_golden_year_hero.png"
						/>
					</div>
				</header>

				{/* Content Layout */}
				<div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
					{/* Sidebar Stats & Quote */}
					<aside className="lg:col-span-4 flex flex-col gap-6 sticky top-28">
						<Card className="shadow-sm">
							<CardHeader className="border-b border-border pb-4">
								<CardTitle className="text-xl font-bold text-foreground">
									Oliver's Profile
								</CardTitle>
							</CardHeader>
							<CardContent className="pt-4">
								<ul className="space-y-4">
									<li className="flex items-center gap-3 py-1 border-b border-border/50">
										<div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
											<Cake className="w-5 h-5" />
										</div>
										<div>
											<span className="text-xs font-semibold text-muted-foreground uppercase block">
												Age
											</span>
											<span className="text-sm font-medium text-foreground">
												10 Years Old
											</span>
										</div>
									</li>

									<li className="flex items-center gap-3 py-1 border-b border-border/50">
										<div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
											<Dog className="w-5 h-5" />
										</div>
										<div>
											<span className="text-xs font-semibold text-muted-foreground uppercase block">
												Breed
											</span>
											<span className="text-sm font-medium text-foreground">
												Labrador Mix
											</span>
										</div>
									</li>

									<li className="flex items-center gap-3 py-1 border-b border-border/50">
										<div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
											<Timer className="w-5 h-5" />
										</div>
										<div>
											<span className="text-xs font-semibold text-muted-foreground uppercase block">
												Time in Shelter
											</span>
											<span className="text-sm font-medium text-foreground">
												200 Days
											</span>
										</div>
									</li>

									<li className="flex items-center gap-3 py-1">
										<div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
											<Sun className="w-5 h-5" />
										</div>
										<div>
											<span className="text-xs font-semibold text-muted-foreground uppercase block">
												Favorite Activity
											</span>
											<span className="text-sm font-medium text-foreground">
												Napping in the sun
											</span>
										</div>
									</li>
								</ul>
							</CardContent>
						</Card>

						{/* Quote Card */}
						<div className="bg-primary text-primary-foreground rounded-xl p-6 shadow-sm relative overflow-hidden">
							<Quote className="w-32 h-32 text-primary-foreground/10 absolute -top-4 -right-4 pointer-events-none" />
							<div className="relative z-10">
								<p className="text-lg md:text-xl font-serif italic mb-4 leading-snug">
									"We weren't looking for a senior dog, but the moment Oliver rested his
									grey muzzle on my knee, we knew he was meant to be with us."
								</p>
								<p className="text-xs font-bold uppercase tracking-wider opacity-90">
									— The Martinez Family
								</p>
							</div>
						</div>
					</aside>

					{/* Story Content */}
					<article className="lg:col-span-8 flex flex-col gap-8">
						{/* Section 1 */}
						<Card className="shadow-sm">
							<CardHeader className="pb-2">
								<CardTitle className="text-2xl md:text-3xl font-bold text-primary flex items-center gap-2">
									<Milestone className="w-6 h-6" />
									The Journey
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4 text-muted-foreground leading-relaxed">
								<p>
									Oliver arrived at Haven Shelter on a cold Tuesday evening. Surrendered due
									to his previous owner's failing health, the transition was hard on the
									10-year-old Labrador mix. For the first few weeks, Oliver preferred the
									quiet corner of his kennel, watching the bustling shelter life with
									gentle, amber eyes.
								</p>

								<div className="my-6 relative overflow-hidden rounded-lg h-64 border border-border shadow-sm">
									<img
										alt="An older, gentle-looking Labrador mix looking out patiently from behind a clean shelter enclosure"
										className="w-full h-full object-cover"
										src="https://lh3.googleusercontent.com/aida-public/AB6AXuCNR-nkXybB9vF3-kNkodaoQn1jPMioSdQl7teRG1sfHFJTOpEO5uJSe_JVnB4aoioEwD0XaToCGbIhzGc4XQePXs7j7pRuPM2U2ECpJhXecXGh6benNDGnGU0NDDj-D3effX1DDt6AjLmtGt1SiIEbD0-Ev7ya0va8fMKqWV8lKq8CeQnD9T2QpCxvxxp1QXErxfez1cyOJE09N-a4Qdp7YaTS-1yIymYG43zH8lmCL9Qvfasc0rtLbr0w3afn9guvy0jyTF6OXs1h"
									/>
								</div>

								<p>
									Senior dogs often have a longer wait for adoption. Puppies and young
									adults typically catch the eye of visitors first. Oliver waited 200 days.
									During that time, he became a staff favorite, known for his calm demeanor
									and his insistence on carrying a plush squeaky toy during his daily walks.
								</p>
							</CardContent>
						</Card>

						{/* Section 2 */}
						<Card className="shadow-sm">
							<CardHeader className="pb-2">
								<CardTitle className="text-2xl md:text-3xl font-bold text-primary flex items-center gap-2">
									<Home className="w-6 h-6" />A New Chapter
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4 text-muted-foreground leading-relaxed">
								<p>
									When the Martinez family visited the shelter, they were initially looking
									for a younger, active dog. However, a shelter volunteer suggested they
									meet Oliver. It was love at first sight. Oliver walked into the greeting
									room, bypassed the toys, and gently rested his head on Sarah Martinez's
									lap.
								</p>
								<p>
									Today, Oliver's days look very different. His favorite spot is a
									sun-drenched rug in the living room where he spends his afternoons
									napping. He has a younger dog sibling to show the ropes, and enjoys
									leisurely evening strolls around the neighborhood.
								</p>

								<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
									<div className="h-48 rounded-lg overflow-hidden border border-border shadow-sm">
										<img
											className="w-full h-full object-cover"
											alt="A senior Labrador sleeping peacefully in a patch of golden afternoon sunlight on a rug"
											src="https://lh3.googleusercontent.com/aida-public/AB6AXuCe5wzBN-Y8cnEcBy5f1QhGDMo4OLBOJIG61EhPOHw8j9jQ4DnxxzrS3POJIUCc8LJh-rJrnmuJfHJT9Vd5E918bN-xLkTj6thdY1YuHUQ5d74BG-Cu8Yl21ztxfPh0tv8l6wBlEyqKkCjFAtXCAVpMfRBPD0FqjdhvKpBBaqUday0y-EJEoFWFZ1HVk3IvnxtEKM4rI_cVvGe4A-5_ruhJeas2yDrORNvsazJ_0LuzlthASGdnQjqVo2qEV5GSBnweDK0ewmkGQmr-"
										/>
									</div>
									<div className="h-48 rounded-lg overflow-hidden border border-border shadow-sm">
										<img
											className="w-full h-full object-cover"
											alt="A senior Labrador walking happily next to a loving family in a park"
											src="https://lh3.googleusercontent.com/aida-public/AB6AXuAP0Rm44h5LOZAodMPes87CNapo7Bs-yGlasFtcByxy07ns-1GXMUxFUWOHb6aVeG7QO7w2MQ5OxvCmRSzbuqgP2jS9WMPW4pP_wYTK1KKFPCV9GPbp8TYQYRBAOIK3rJf3SSdoGZduPU_Sk2dDmlpe6QArlv5XoNW6IlZVUj3VL3SfBc8hwgyP7dDfuABcdwfmZxCcBZj_u6OgNwSIxsbrPuZwZYEi1ARDw8WPmGm7R0B58JtqoKbozfwWJTmgPsrORD4hk0YR5PwP"
										/>
									</div>
								</div>
							</CardContent>
						</Card>

						{/* Call to Action Box */}
						<Card className="bg-muted/30 border-border text-center shadow-sm">
							<CardHeader>
								<CardTitle className="text-xl md:text-2xl font-bold text-foreground">
									Help More Seniors Like Oliver
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-6">
								<p className="text-sm text-muted-foreground max-w-xl mx-auto">
									There are many older dogs at Haven Shelter waiting for their second chance
									at a happy life.
								</p>
								<div className="flex flex-col sm:flex-row gap-4 justify-center">
									<Link to="/donate" viewTransition prefetch="intent">
										<Button size="lg">Sponsor a Senior</Button>
									</Link>
									<Link to="/sign-up" viewTransition prefetch="intent">
										<Button size="lg" variant="outline">
											Adopt Seniors
										</Button>
									</Link>
								</div>
							</CardContent>
						</Card>
					</article>
				</div>
			</main>
		</div>
	);
}
