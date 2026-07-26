import { useState } from "react";
import {
	Heart,
	Building2,
	Copy,
	Check,
	ShieldCheck,
	Sparkles,
	Gift,
	HelpCircle,
	Receipt,
} from "lucide-react";

import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "~/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";

export default function DonationPage() {
	const [copiedAccount, setCopiedAccount] = useState<string | null>(null);

	const copyToClipboard = (text: string, id: string) => {
		navigator.clipboard.writeText(text);
		setCopiedAccount(id);
		setTimeout(() => setCopiedAccount(null), 2000);
	};

	return (
		<div className="bg-background text-foreground antialiased min-h-screen flex flex-col font-sans selection:bg-primary/20 selection:text-primary">
			{/* Main Content */}
			<main className="grow">
				{/* Hero Banner */}
				<section className="relative py-16 md:py-24 px-6 bg-muted/30 border-b border-border text-center overflow-hidden">
					<div className="max-w-3xl mx-auto space-y-4 relative z-10">
						<Badge
							variant="secondary"
							className="px-3 py-1 text-xs uppercase tracking-wider bg-background border border-primary/20 text-primary"
						>
							<Heart className="w-3.5 h-3.5 fill-primary mr-1.5 inline" />
							Support Our Mission
						</Badge>
						<h1 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground leading-tight">
							Fuel Second Chances with Every Contribution
						</h1>
						<p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
							100% of direct wire transfers go directly to food, emergency medical operations,
							and daily rehabilitation care for rescue animals.
						</p>
					</div>
				</section>

				{/* Core Content Grid */}
				<section className="py-16 px-6 max-w-7xl mx-auto">
					<div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
						{/* Left Column: Bank Accounts & Wire Transfer Details */}
						<div className="lg:col-span-7 space-y-8">
							<div>
								<h2 className="text-2xl md:text-3xl font-bold text-foreground">
									Direct Bank Wire Details
								</h2>
								<p className="text-sm text-muted-foreground mt-1">
									Choose your preferred currency or banking partner to initiate a fee-free
									bank transfer.
								</p>
							</div>

							<Tabs defaultValue="local" className="w-full">
								<TabsList className="grid w-full grid-cols-2 mb-6">
									<TabsTrigger value="local">Domestic / USD Account</TabsTrigger>
									<TabsTrigger value="international">
										International Wire (EUR/GBP)
									</TabsTrigger>
								</TabsList>

								{/* Local / USD Tab */}
								<TabsContent value="local" className="space-y-4">
									{/* Account 1 */}
									<Card className="shadow-sm border-border">
										<CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
											<div>
												<CardTitle className="text-lg font-bold flex items-center gap-2">
													<Building2 className="w-5 h-5 text-primary" />
													Chase Bank (Primary Operating)
												</CardTitle>
												<CardDescription className="text-xs">
													For General Animal Care & Food Supplies
												</CardDescription>
											</div>
											<Badge variant="outline" className="text-xs">
												USD $
											</Badge>
										</CardHeader>
										<CardContent className="space-y-3 pt-2 text-xs md:text-sm">
											<div className="flex justify-between items-center py-2 border-b border-border/60">
												<span className="text-muted-foreground font-medium">
													Account Title
												</span>
												<span className="font-semibold text-foreground">
													Safe Haven Animal Foundation
												</span>
											</div>
											<div className="flex justify-between items-center py-2 border-b border-border/60">
												<span className="text-muted-foreground font-medium">
													Account Number
												</span>
												<div className="flex items-center gap-2">
													<code className="font-mono bg-muted px-2 py-1 rounded text-foreground font-semibold">
														9876 5432 1098
													</code>
													<Button
														variant="ghost"
														size="icon"
														className="h-7 w-7"
														onClick={() =>
															copyToClipboard("987654321098", "acc1")
														}
													>
														{copiedAccount === "acc1" ? (
															<Check className="w-3.5 h-3.5 text-green-600" />
														) : (
															<Copy className="w-3.5 h-3.5" />
														)}
													</Button>
												</div>
											</div>
											<div className="flex justify-between items-center py-2 border-b border-border/60">
												<span className="text-muted-foreground font-medium">
													Routing / ABA
												</span>
												<div className="flex items-center gap-2">
													<code className="font-mono bg-muted px-2 py-1 rounded text-foreground font-semibold">
														021000021
													</code>
													<Button
														variant="ghost"
														size="icon"
														className="h-7 w-7"
														onClick={() => copyToClipboard("021000021", "route1")}
													>
														{copiedAccount === "route1" ? (
															<Check className="w-3.5 h-3.5 text-green-600" />
														) : (
															<Copy className="w-3.5 h-3.5" />
														)}
													</Button>
												</div>
											</div>
										</CardContent>
									</Card>

									{/* Account 2 */}
									<Card className="shadow-sm border-border">
										<CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
											<div>
												<CardTitle className="text-lg font-bold flex items-center gap-2">
													<Building2 className="w-5 h-5 text-primary" />
													Bank of America (Emergency Medical Fund)
												</CardTitle>
												<CardDescription className="text-xs">
													Dedicated strictly to surgeries & veterinary care
												</CardDescription>
											</div>
											<Badge variant="outline" className="text-xs">
												USD $
											</Badge>
										</CardHeader>
										<CardContent className="space-y-3 pt-2 text-xs md:text-sm">
											<div className="flex justify-between items-center py-2 border-b border-border/60">
												<span className="text-muted-foreground font-medium">
													Account Title
												</span>
												<span className="font-semibold text-foreground">
													Safe Haven Emergency Rescue
												</span>
											</div>
											<div className="flex justify-between items-center py-2 border-b border-border/60">
												<span className="text-muted-foreground font-medium">
													Account Number
												</span>
												<div className="flex items-center gap-2">
													<code className="font-mono bg-muted px-2 py-1 rounded text-foreground font-semibold">
														4321 8765 0012
													</code>
													<Button
														variant="ghost"
														size="icon"
														className="h-7 w-7"
														onClick={() =>
															copyToClipboard("432187650012", "acc2")
														}
													>
														{copiedAccount === "acc2" ? (
															<Check className="w-3.5 h-3.5 text-green-600" />
														) : (
															<Copy className="w-3.5 h-3.5" />
														)}
													</Button>
												</div>
											</div>
											<div className="flex justify-between items-center py-2 border-b border-border/60">
												<span className="text-muted-foreground font-medium">
													Routing / ABA
												</span>
												<div className="flex items-center gap-2">
													<code className="font-mono bg-muted px-2 py-1 rounded text-foreground font-semibold">
														031000053
													</code>
													<Button
														variant="ghost"
														size="icon"
														className="h-7 w-7"
														onClick={() => copyToClipboard("031000053", "route2")}
													>
														{copiedAccount === "route2" ? (
															<Check className="w-3.5 h-3.5 text-green-600" />
														) : (
															<Copy className="w-3.5 h-3.5" />
														)}
													</Button>
												</div>
											</div>
										</CardContent>
									</Card>
								</TabsContent>

								{/* International Tab */}
								<TabsContent value="international" className="space-y-4">
									<Card className="shadow-sm border-border">
										<CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
											<div>
												<CardTitle className="text-lg font-bold flex items-center gap-2">
													<Building2 className="w-5 h-5 text-primary" />
													HSBC Global Swift Account
												</CardTitle>
												<CardDescription className="text-xs">
													For Supporters Transferring from Europe & UK
												</CardDescription>
											</div>
											<Badge variant="outline" className="text-xs">
												EUR € / GBP £
											</Badge>
										</CardHeader>
										<CardContent className="space-y-3 pt-2 text-xs md:text-sm">
											<div className="flex justify-between items-center py-2 border-b border-border/60">
												<span className="text-muted-foreground font-medium">
													IBAN
												</span>
												<div className="flex items-center gap-2">
													<code className="font-mono bg-muted px-2 py-1 rounded text-foreground font-semibold">
														GB82 HSBC 4005 1512 3456 78
													</code>
													<Button
														variant="ghost"
														size="icon"
														className="h-7 w-7"
														onClick={() =>
															copyToClipboard("GB82HSBC40051512345678", "iban")
														}
													>
														{copiedAccount === "iban" ? (
															<Check className="w-3.5 h-3.5 text-green-600" />
														) : (
															<Copy className="w-3.5 h-3.5" />
														)}
													</Button>
												</div>
											</div>
											<div className="flex justify-between items-center py-2 border-b border-border/60">
												<span className="text-muted-foreground font-medium">
													SWIFT / BIC
												</span>
												<div className="flex items-center gap-2">
													<code className="font-mono bg-muted px-2 py-1 rounded text-foreground font-semibold">
														MIDLGB22
													</code>
													<Button
														variant="ghost"
														size="icon"
														className="h-7 w-7"
														onClick={() => copyToClipboard("MIDLGB22", "swift")}
													>
														{copiedAccount === "swift" ? (
															<Check className="w-3.5 h-3.5 text-green-600" />
														) : (
															<Copy className="w-3.5 h-3.5" />
														)}
													</Button>
												</div>
											</div>
										</CardContent>
									</Card>
								</TabsContent>
							</Tabs>

							{/* Tax Receipt Guidance Box */}
							<div className="p-6 bg-muted/40 rounded-xl border border-border flex items-start gap-4">
								<Receipt className="w-8 h-8 text-primary shrink-0 mt-1" />
								<div className="space-y-1 text-xs md:text-sm">
									<h4 className="font-semibold text-foreground">
										Need a Tax Exemption Receipt?
									</h4>
									<p className="text-muted-foreground leading-relaxed">
										If you require an official donation tax receipt for wire transfers,
										please email your transaction proof to{" "}
										<a
											href="mailto:donations@Safe Haven.org"
											className="text-primary underline font-medium"
										>
											donations@Safe Haven.org
										</a>{" "}
										with your legal name and contact address.
									</p>
								</div>
							</div>
						</div>

						{/* Right Column: Appreciation, Transparency, & Impact */}
						<aside className="lg:col-span-5 space-y-6 sticky top-28">
							{/* Gratitude & Appreciation Card */}
							<Card className="bg-primary/5 border-primary/20 shadow-sm relative overflow-hidden">
								<CardHeader className="pb-2">
									<Badge
										variant="secondary"
										className="w-fit mb-2 bg-background border border-primary/20 text-primary"
									>
										<Sparkles className="w-3 h-3 mr-1" /> Heartfelt Thanks
									</Badge>
									<CardTitle className="text-2xl font-bold text-foreground">
										Your Generosity Means Everything
									</CardTitle>
								</CardHeader>
								<CardContent className="space-y-3 text-xs md:text-sm text-muted-foreground leading-relaxed">
									<p>
										Every animal that walks, limps, or purrs through our shelter doors
										arrives with a story. Thanks to compassionate supporters like you,
										their next chapter is filled with warmth, medicine, and love.
									</p>
									<p>
										Without your financial partnership, covering our daily veterinary
										costs, specialised nutrition diets, and warm housing would simply not
										be possible.
									</p>
								</CardContent>
								<CardFooter className="pt-2">
									<div className="flex items-center gap-3">
										<div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary">
											SOS
										</div>
										<div>
											<div className="text-xs font-bold text-foreground">
												The Safe Haven Rescue Team
											</div>
											<div className="text-[11px] text-muted-foreground">
												On behalf of 140+ resident animals
											</div>
										</div>
									</div>
								</CardFooter>
							</Card>

							{/* Impact Breakdown Card */}
							<Card className="shadow-sm border-border">
								<CardHeader className="pb-3">
									<CardTitle className="text-lg font-bold text-foreground flex items-center gap-2">
										<Gift className="w-5 h-5 text-primary" />
										How Your Money Helps
									</CardTitle>
								</CardHeader>
								<CardContent className="space-y-4 text-xs md:text-sm">
									<div className="flex items-start gap-3">
										<div className="p-2 rounded-lg bg-muted text-primary font-bold shrink-0">
											$25
										</div>
										<div>
											<h5 className="font-semibold text-foreground">
												Weekly Nourishment
											</h5>
											<p className="text-xs text-muted-foreground">
												Provides high-protein food and treats for two rescue dogs for
												an entire week.
											</p>
										</div>
									</div>
									<div className="flex items-start gap-3">
										<div className="p-2 rounded-lg bg-muted text-primary font-bold shrink-0">
											$100
										</div>
										<div>
											<h5 className="font-semibold text-foreground">
												Vaccinations & Microchips
											</h5>
											<p className="text-xs text-muted-foreground">
												Covers complete initial health checks, vaccinations, and
												microchipping for newly rescued litters.
											</p>
										</div>
									</div>
									<div className="flex items-start gap-3">
										<div className="p-2 rounded-lg bg-muted text-primary font-bold shrink-0">
											$350
										</div>
										<div>
											<h5 className="font-semibold text-foreground">
												Emergency Surgery
											</h5>
											<p className="text-xs text-muted-foreground">
												Funds life-saving spay/neuter operations, fracture repair, and
												intensive care recovery.
											</p>
										</div>
									</div>
								</CardContent>
							</Card>

							{/* Guarantees Box */}
							<div className="p-4 rounded-xl border border-border bg-background flex items-center justify-between text-xs text-muted-foreground">
								<span className="flex items-center gap-2">
									<ShieldCheck className="w-4 h-4 text-primary" /> Registered Non-Profit
									501(c)(3)
								</span>
								<span className="flex items-center gap-2">
									<HelpCircle className="w-4 h-4 text-primary" /> 100% Financial
									Transparency
								</span>
							</div>
						</aside>
					</div>
				</section>
			</main>
		</div>
	);
}
