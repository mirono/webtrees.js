import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Sun,
    Moon,
    Globe,
    LogIn,
    Search,
    TreePine,
    PieChart,
    List,
    Calendar,
    ChevronLeft,
    ChevronRight,
    Eye
} from "lucide-react";

const Home = () => {
    const [theme, setTheme] = useState<"light" | "dark">("light");
    const [currentSlide, setCurrentSlide] = useState(0);

    const toggleTheme = () => {
        setTheme(theme === "light" ? "dark" : "light");
    };

    const slides = [
        { title: "Welcome to Your Family Tree", image: "🌳" },
        { title: "Discover Your Heritage", image: "📜" },
        { title: "Connect with Your Past", image: "🏛️" },
    ];

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
    };

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    };

    return (
        <div className="min-h-screen bg-background flex flex-col">
            {/* Fixed Top Navbar */}
            <header className="fixed top-0 left-0 right-0 z-50 bg-card text-card-foreground border-b border-border shadow-sm">
                <div className="container mx-auto px-4 py-3">
                    <div className="flex items-center justify-between">
                        <h1 className="text-xl font-bold text-foreground">webtrees</h1>

                        <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm" onClick={toggleTheme}>
                                {theme === "light" ? (
                                    <Moon className="h-4 w-4" />
                                ) : (
                                    <Sun className="h-4 w-4" />
                                )}
                            </Button>

                            <Button variant="ghost" size="sm">
                                <Globe className="h-4 w-4 mr-2" />
                                <span className="hidden sm:inline">Language</span>
                            </Button>

                            <Button variant="ghost" size="sm">
                                <LogIn className="h-4 w-4 mr-2" />
                                <span className="hidden sm:inline">Sign in</span>
                            </Button>

                            <Button variant="ghost" size="sm">
                                <Search className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Button Bar */}
            <div className="fixed top-[57px] left-0 right-0 z-40 bg-card text-card-foreground border-b border-border">
                <div className="container mx-auto px-4 py-2">
                    <div className="flex items-center gap-2 overflow-x-auto">
                        <Button variant="ghost" size="sm" className="flex items-center gap-2">
                            <TreePine className="h-4 w-4" />
                            <span className="hidden sm:inline">Family trees</span>
                        </Button>

                        <Button variant="ghost" size="sm" className="flex items-center gap-2">
                            <PieChart className="h-4 w-4" />
                            <span className="hidden sm:inline">Charts</span>
                        </Button>

                        <Button variant="ghost" size="sm" className="flex items-center gap-2">
                            <List className="h-4 w-4" />
                            <span className="hidden sm:inline">Lists</span>
                        </Button>

                        <Button variant="ghost" size="sm" className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span className="hidden sm:inline">Calendar</span>
                        </Button>

                        <Button variant="ghost" size="sm" className="flex items-center gap-2">
                            <Search className="h-4 w-4" />
                            <span className="hidden sm:inline">Reports</span>
                        </Button>

                        <Button variant="ghost" size="sm" className="flex items-center gap-2">
                            <Search className="h-4 w-4" />
                            <span className="hidden sm:inline">Search</span>
                        </Button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <main className="flex-1 pt-[120px] pb-20">
                <div className="container mx-auto px-4 py-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Statistics Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Statistics</CardTitle>
                                <CardDescription>Family tree overview</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">Individuals</span>
                                    <span className="font-semibold">0</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">Families</span>
                                    <span className="font-semibold">0</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">Sources</span>
                                    <span className="font-semibold">0</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">Media objects</span>
                                    <span className="font-semibold">0</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">Repositories</span>
                                    <span className="font-semibold">0</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">Notes</span>
                                    <span className="font-semibold">0</span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Slide Show Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Slide show</CardTitle>
                                <CardDescription>Featured content</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="relative">
                                    <div className="bg-muted/50 rounded-lg h-48 flex items-center justify-center text-6xl">
                                        {slides[currentSlide].image}
                                    </div>
                                    <p className="text-center mt-4 text-sm font-medium">
                                        {slides[currentSlide].title}
                                    </p>

                                    <div className="flex justify-center gap-2 mt-4">
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            onClick={prevSlide}
                                            className="h-8 w-8"
                                        >
                                            <ChevronLeft className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            onClick={nextSlide}
                                            className="h-8 w-8"
                                        >
                                            <ChevronRight className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Right Column with On This Day and Sign In */}
                        <div className="space-y-6">
                            {/* On This Day Card */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>On this day</CardTitle>
                                    <CardDescription>
                                        {new Date().toLocaleDateString('en-US', {
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground">
                                        No events recorded for this date in your family tree.
                                    </p>
                                </CardContent>
                            </Card>

                            {/* Sign In Form Card */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Sign in</CardTitle>
                                    <CardDescription>Access your family tree</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="username">Username or email</Label>
                                        <Input
                                            id="username"
                                            type="text"
                                            placeholder="Enter your username"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="password">Password</Label>
                                        <Input
                                            id="password"
                                            type="password"
                                            placeholder="Enter your password"
                                        />
                                    </div>

                                    <Button className="w-full">
                                        <LogIn className="h-4 w-4 mr-2" />
                                        Sign in
                                    </Button>

                                    <div className="text-center">
                                        <Button variant="link" size="sm" className="text-xs">
                                            Forgot password?
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="bg-card border-t border-border py-6 mt-auto">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                            <Eye className="h-4 w-4" />
                            <span>Views: 1,234</span>
                        </div>

                        <div className="flex items-center gap-4">
                            <span>© {new Date().getFullYear()} webtrees</span>
                            <Button variant="link" size="sm" className="h-auto p-0 text-muted-foreground">
                                Privacy Policy
                            </Button>
                            <Button variant="link" size="sm" className="h-auto p-0 text-muted-foreground">
                                Terms of Service
                            </Button>
                            <Button variant="link" size="sm" className="h-auto p-0 text-muted-foreground">
                                Contact
                            </Button>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Home;
