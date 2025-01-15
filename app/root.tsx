import { useState, useEffect } from "react";
import {
  Form,
  Meta,
  Scripts,
  ScrollRestoration
} from "@remix-run/react";

import "~/styles/common/root.css";
import "~/styles/common/tailwind.css";

import { UserRoundPen, Check, Info, PersonStanding } from "lucide-react"
import { Label } from "~/components/ui/label"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Badge } from "~/components/ui/badge"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  DrawerClose,
} from "~/components/ui/drawer"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip"
import { Slider } from "~/components/ui/slider"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "~/components/ui/carousel"

type ActivityLevel = 'none' | 'little' | 'some' | 'lots' | 'tons';

type ProfileEntry = {
  date: string;
  weight: number;
  bodyFatPercentage: number;
  age: number;
  activityLevel: ActivityLevel;
};

const ACTIVITY_LABELS: Record<ActivityLevel, string> = {
  none: "None",
  little: "A little",
  some: "Some",
  lots: "A lot",
  tons: "A ton"
};

const ACTIVITY_DEFINITIONS: Record<ActivityLevel, string> = {
  none: "little or no physical activity",
  little: "1 to 3 hours of exercise or sports per week",
  some: "4 to 6 hours of exercise or sports per week",
  lots: "7 to 9 hours of exercise or sports per week",
  tons: "10+ hours of exercise or sports per week"
};

const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  none: 1.15,
  little: 1.3,
  some: 1.5,
  lots: 1.7,
  tons: 1.9
};

export function calculateBMR(
  weightLbs: number,
  bodyFatPercentage: number = 25,
  age: number
): number {
  
  const weightKg = weightLbs * 0.45359237; // Convert weight to kg
  const leanMassKg = weightKg * (1 - (bodyFatPercentage / 100)); // Calculate Lean Body Mass (LBM)
  const ageAdjustmentFactor = 1 - (Math.max(0, age - 20) * 0.002); // Katch-McArdle Formula with age adjustment; Reduce BMR by approximately 2% per decade after age 20
  const bmr = (370 + (21.6 * leanMassKg)) * ageAdjustmentFactor; 
  
  return Math.round(bmr);
}

export function calculateTDEE(
  weightLbs: number,
  bodyFatPercentage: number = 25,
  age: number,
  activityLevel: ActivityLevel
): number {
  
  const bmr = calculateBMR(
    weightLbs,
    bodyFatPercentage, 
    age
  )
  const tdee = bmr * ACTIVITY_MULTIPLIERS[activityLevel]; // Calculate TDEE
  
  return Math.round(tdee);
}

export function calculateAdjustedTDEE(baseTDEE: number, weeklyWeightChange: number): number {
  // 3500 calories = 1 pound of weight change
  const calorieAdjustment = weeklyWeightChange * 500;
  return Math.round(baseTDEE + calorieAdjustment);
}

function saveProfile(data: ProfileEntry) {
  const profiles = JSON.parse(localStorage.getItem('profiles') || '[]') as ProfileEntry[];
  const today = new Date().toISOString().split('T')[0];
  
  const existingIndex = profiles.findIndex(p => p.date === today);
  
  if (existingIndex >= 0) {
    profiles[existingIndex] = { ...data, date: today };
  } else {
    profiles.push({ ...data, date: today });
  }
  
  localStorage.setItem('profiles', JSON.stringify(profiles));
}

export default function App() {

  const [isSaved, setIsSaved] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [latestProfile, setLatestProfile] = useState<ProfileEntry | null>(() => getLatestProfile());
  const [hasProfile, setHasProfile] = useState(false);
  const [sliderValue, setSliderValue] = useState(0);
 
  function onClick(e) {
    e.preventDefault();
    const form = e.currentTarget.closest('form');
    if (!form) return;
    
    const formData = new FormData(form);
    const data: ProfileEntry = {
      date: new Date().toISOString().split('T')[0],
      weight: Number(formData.get('weight')),
      bodyFatPercentage: Number(formData.get('body_fat_percentage')),
      age: Number(formData.get('age')),
      activityLevel: formData.get('activity_level') as ActivityLevel
    };
    
    saveProfile(data);
    setIsSaved(true);
    
    setTimeout(() => {
      setIsSaved(false);
      (document.querySelector('[data-drawer-close]') as HTMLElement)?.click();
    }, 1000);
  }
  
  function getLatestProfile(): ProfileEntry | null {
    try {
      const profiles = JSON.parse(localStorage.getItem('profiles') || '[]') as ProfileEntry[];
      if (profiles.length === 0) return null;
      
      // Sort by date and get the most recent
      return profiles.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
    } catch (error) {
      console.error('Error loading profile:', error);
      return null;
    }
  }

  function onValueChange(value: number[]) {
    setSliderValue(value[0]);
  }

  useEffect(() => {
    setMounted(true);
    setLatestProfile(getLatestProfile());
  }, [isSaved]);

  useEffect(() => {
    setHasProfile(mounted && latestProfile !== null);
  }, [mounted, latestProfile]);
  
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1"
        />
        <Meta />
      </head>
      <body className="bg-stone-100">
        <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
          <div className="container flex gap-1 h-14 items-center justify-center mx-auto">
          <PersonStanding /> <span className="font-semibold">Burn Rate Calculator</span>
          </div>
        </header>
        <div className="min-h-[calc(100vh-4rem)] flex flex-col gap-9 items-center justify-center">
          <Drawer>
            <DrawerTrigger asChild>
              <Button variant="outline">
                <UserRoundPen /> { hasProfile ? `Update your profile` : `Set your profile` }
              </Button>
            </DrawerTrigger>
            <DrawerContent>
              <div className="mx-auto w-full max-w-xl">
                <DrawerHeader>
                  <DrawerTitle>{ hasProfile ? `Update your profile` : `Set your profile` }</DrawerTitle>
                  <DrawerDescription>We use these metrics to calculate your total daily energy expenditure (TDEE) based on the Katch-McArdle Formula.</DrawerDescription>
                </DrawerHeader>
                <div className="p-4">
                  <Form>
                    <div className="grid grid-cols-3 gap-4 pb-8">
                      <div className="col-span-3">
                        <Label>Level of activity</Label>
                        <Select 
                          name="activity_level" 
                          defaultValue={latestProfile?.activityLevel || (Object.keys(ACTIVITY_LABELS) as ActivityLevel[])[1]}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Activity level" />
                          </SelectTrigger>
                          <SelectContent>
                            {(Object.keys(ACTIVITY_LABELS) as ActivityLevel[]).map((level) => (
                              <SelectItem key={level} value={level}>
                                {ACTIVITY_LABELS[level]} ({ACTIVITY_DEFINITIONS[level]})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Weight in lbs</Label>
                        <Input 
                          aria-label="Weight in lbs"
                          id="weight"
                          name="weight"
                          placeholder="lbs"
                          type="number" 
                          max="9999"
                          min="0"
                          defaultValue={latestProfile?.weight || 150}
                        />
                      </div>
                      <div>
                        <Label>Age</Label>
                        <Input 
                          aria-label="Age"
                          id="age"
                          name="age"
                          placeholder="35"
                          type="number" 
                          max="999"
                          min="0"
                          defaultValue={latestProfile?.age || 35}
                        />
                      </div>
                      <div>
                        <Label>Body Fat %</Label>
                        <Input 
                          aria-label="Body fat percentae"
                          id="body-fat-percentage"
                          name="body_fat_percentage"
                          placeholder="25"
                          type="number" 
                          max="999"
                          min="0"
                          defaultValue={latestProfile?.bodyFatPercentage || 25}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <Button 
                        className="w-full" 
                        onClick={onClick} 
                        variant={isSaved ? "secondary" : "default"}
                      >
                        {isSaved ? (
                          <>
                            <Check className="h-4 w-4" /> Saved
                          </>
                        ) : (
                          'Save'
                        )}
                      </Button>
                      <DrawerClose asChild className="w-full" data-drawer-close>
                        <Button variant="outline">Cancel</Button>
                      </DrawerClose>
                    </div>
                  </Form>
                </div>
                <DrawerFooter>
                </DrawerFooter>
              </div>
            </DrawerContent>
          </Drawer>
          
          {hasProfile && ( 
            <>
              <div className="grid max-sm:max-w-[92vw] sm:min-w-[500px] rounded-lg border overflow-hidden bg-white">
                <div className="flex flex-wrap gap-2 items-center justify-left justify-between p-5">
                  <h2 className="text-xs uppercase tracking-wide font-semibold w-full">Your recent profile</h2>
                  <span className="flex items-end gap-1">
                    <span className="text-2xl font-semibold leading-none">{latestProfile!.weight}</span>
                    <span className="text-xs text-muted-foreground">lbs</span> 
                  </span>
                  <span className="flex items-end gap-1">
                    <span className="text-2xl font-semibold leading-none">{latestProfile!.bodyFatPercentage}%</span>
                    <span className="text-xs text-muted-foreground">body fat</span> 
                  </span>
                  <span className="flex items-end gap-1">
                    <span className="text-2xl font-semibold leading-none first-letter:capitalize">{latestProfile!.activityLevel}</span>
                    <span className="text-xs text-muted-foreground">activity</span> 
                  </span>
                  <span className="flex items-end gap-1">
                    <span className="text-2xl font-semibold leading-none">{latestProfile!.age}</span>
                    <span className="text-xs text-muted-foreground">y.o.</span> 
                  </span>
                </div>
                <div className="flex items-center justify-left justify-between">
                  <div className="flex flex-col gap-1 w-6/12 p-5 bg-green-50 border-green-700 border rounded-bl-lg">
                    <TooltipProvider delayDuration={300}>
                      <Tooltip>
                        <TooltipTrigger className="text-xs uppercase tracking-wide font-semibold flex gap-1">TDEE <Info size={14} /></TooltipTrigger>
                        <TooltipContent className="bg-black max-w-[200px]">
                          <p>TDEE (Total Daily Energy Expenditure) is the total amount of energy you expend every 24 hours, expressed in calories.</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <div className="flex items-end gap-1">
                      <span className="text-2xl font-semibold leading-none">{calculateTDEE(
                        latestProfile!.weight,
                        latestProfile!.bodyFatPercentage,
                        latestProfile!.age,
                        latestProfile!.activityLevel
                      )}</span>
                      <span className="text-xs text-muted-foreground">cal</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1 w-6/12 p-5 border-t">
                    <TooltipProvider delayDuration={300}>
                      <Tooltip>
                        <TooltipTrigger className="text-xs uppercase tracking-wide font-semibold flex gap-1">BMR <Info size={14} /></TooltipTrigger>
                        <TooltipContent className="bg-black max-w-[200px]">
                          <p>BMR (Basal Metabolic Rate) is the number of calories your body burns performing basic vital functions, such as breathing, pumping blood around your body, and maintaining brain function</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <div className="flex items-end gap-1">
                      <span className="text-2xl font-semibold leading-none">{calculateBMR(
                        latestProfile!.weight,
                        latestProfile!.bodyFatPercentage,
                        latestProfile!.age
                      )}</span>
                      <span className="text-xs text-muted-foreground">cal</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex flex-col max-w-full sm:max-w-[540px] sm:min-w-[500px]">
                <Slider defaultValue={[0]} max={2} min={-2} step={0.25} onValueChange={onValueChange} className="max-sm:max-w-[92vw] mx-auto" />
                <span className="text-sm text- text-center p-3"> 
                  {sliderValue === 0 
                    ? `Maintain ${latestProfile!.weight} lbs`
                    : sliderValue < 0
                      ? `Lose ${Math.abs(sliderValue)} lbs per week`
                      : `Gain ${sliderValue} lbs per week`
                  }
                </span>
                <Carousel 
                  className="w-full" 
                  opts={{
                    loop: true,
                    align: "center",
                    startIndex: (Object.keys(ACTIVITY_LABELS) as ActivityLevel[])
                      .findIndex(level => level === latestProfile!.activityLevel)
                  }}
                >
                  <CarouselContent>
                    {(Object.keys(ACTIVITY_LABELS) as ActivityLevel[]).map((level) => (
                      <CarouselItem key={level} className="basis-9/12 w-[60%]">
                        <div className={`${level === latestProfile!.activityLevel ? "bg-green-50 border-green-700 " : ""}flex flex-col gap-2 p-6 h-full items-center justify-center rounded-xl border bg-card text-card-foreground shadow`}>
                          {level === latestProfile!.activityLevel && 
                            <Badge variant="secondary">
                              Current
                            </Badge>
                          }
                          <h2 className="md:max-w-[200px] first-letter:capitalize text-center text-sm text-muted-foreground">{ACTIVITY_DEFINITIONS[level]}</h2>
                          <div className="flex items-end gap-1">
                            <span className="text-4xl font-semibold">{calculateAdjustedTDEE(
                              calculateTDEE(
                                latestProfile!.weight,
                                latestProfile!.bodyFatPercentage,
                                latestProfile!.age,
                                level
                              ),
                              sliderValue
                            )}</span>
                            <span className="text-xs text-muted-foreground">cal</span>
                          </div>
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious />
                  <CarouselNext />
                </Carousel>
              </div>
              <p className="max-sm:max-w-[92vw] max-w-full sm:min-w-[500px] bg-yellow-50 border border-yellow-900/10 text-yellow-900 text-sm px-4 py-2 rounded-lg shadow-sm text-center">
                It is <strong>not recommended</strong> to consume less than 1,200 calories a day.
              </p>
            </> 
          )}
        </div>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}