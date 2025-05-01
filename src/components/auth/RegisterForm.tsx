import {
  useEffect,
  useState,
  useRef,
} from 'react';

import { Loader2, Check, ChevronsUpDown, Search } from 'lucide-react';
import { useForm } from 'react-hook-form';
import {
  Link,
  useNavigate,
} from 'react-router-dom';
import { toast } from 'sonner';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  registerFailure,
  registerStart,
  registerSuccess,
} from '@/features/auth/authSlice';
import { useAppDispatch } from '@/lib/hooks';
import { checkEmailExists, checkUsernameExists, signUp } from '@/services/authService';
import { cn } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';

const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
  country: z.string().min(1, "Please select your country"),
  city: z.string().min(1, "Please enter your city"),
  gender: z.string().min(1, "Please select your gender"),
  phone: z.string().optional(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

type Country = {
  code: string;
  name: string;
};

type City = {
  name: string;
};

export const RegisterForm = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState("");
  const [countries, setCountries] = useState<Country[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [loadingCountries, setLoadingCountries] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [countryOpen, setCountryOpen] = useState(false);
  const [cityOpen, setCityOpen] = useState(false);
  const [countrySearchValue, setCountrySearchValue] = useState("");
  
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      country: "",
      city: "",
      gender: "",
      phone: "",
    },
  });

  // Fetch countries on component mount
  useEffect(() => {
    const fetchCountries = async () => {
      setLoadingCountries(true);
      try {
        // Using REST Countries API
        const response = await fetch("https://restcountries.com/v3.1/all");
        const data = await response.json();
        
        const formattedCountries = data.map((country: any) => ({
          code: country.cca2,
          name: country.name.common
        })).sort((a: Country, b: Country) => 
          a.name.localeCompare(b.name)
        );
        setCountries(formattedCountries);
      } catch (error) {
        console.error("Failed to fetch countries:", error);
        toast.error("Failed to load countries. Please try again later.");
      } finally {
        setLoadingCountries(false);
      }
    };

    fetchCountries();
  }, []);

  // Fetch cities when country changes
  useEffect(() => {
    const fetchCities = async () => {
      if (!selectedCountry) return;
      
      setLoadingCities(true);
      try {
        const response = await fetch("https://countriesnow.space/api/v0.1/countries/cities", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ country: selectedCountry }),
        });
        const data = await response.json();
        if(data?.data?.length > 0){
          setCities(data?.data?.map((city: any) => ({ name: city })));
        } else {
          setCities([]);
          // If no cities are found, allow user to enter a city manually
          form.setValue("city", "");
        }
      } catch (error) {
        console.error("Failed to fetch cities:", error);
        setCities([]);
      } finally {
        setLoadingCities(false);
      }
    };

    fetchCities();
  }, [selectedCountry, form]);

  // Check if email exists when email field is blurred
  const validateEmail = async (email: string) => {
    if (!email || !email.includes('@')) return;
    
    setCheckingEmail(true);
    try {
      // Clear any previous manual errors first
      form.clearErrors("email");
      
      const exists = await checkEmailExists(email);
      if (exists) {
        form.setError("email", { 
          type: "manual", 
          message: "Email already exists. Please use a different one or log in."
        });
      }
    } catch (error) {
      console.error("Error checking email:", error);
    } finally {
      setCheckingEmail(false);
    }
  };

  // Check if username exists when username field is blurred
  const validateUsername = async (username: string) => {
    if (username.length < 3) return;
    
    setCheckingUsername(true);
    try {
      // Clear any previous manual errors first
      form.clearErrors("username");
      
      const exists = await checkUsernameExists(username);
      if (exists) {
        form.setError("username", { 
          type: "manual", 
          message: "Username already exists. Please choose a different one."
        });
      }
    } catch (error) {
      console.error("Error checking username:", error);
    } finally {
      setCheckingUsername(false);
    }
  };

  // Add watch on form fields to clear errors when typing
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      // Only clear manual errors, not validation errors from zod schema
      if (name === 'email' && form.formState.errors.email?.type === 'manual') {
        form.clearErrors('email');
      }
      if (name === 'username' && form.formState.errors.username?.type === 'manual') {
        form.clearErrors('username');
      }
    });
    
    return () => subscription.unsubscribe();
  }, [form]);

  const onSubmit = async (data: RegisterFormValues) => {
    try {
      // First check if email exists
      setLoading(true);
      const emailExists = await checkEmailExists(data.email);
      
      if (emailExists) {
        form.setError("email", { 
          type: "manual", 
          message: "Email already exists. Please use a different one or log in."
        });
        setLoading(false);
        return;
      }
      
      // Then check if username exists
      const usernameExists = await checkUsernameExists(data.username);
      
      if (usernameExists) {
        form.setError("username", { 
          type: "manual", 
          message: "Username already exists. Please choose a different one."
        });
        setLoading(false);
        return;
      }
      
      // Then proceed with registration
      dispatch(registerStart());
      
      const userData = await signUp(
        data.email,
        data.password,
        {
          username: data.username,
          country: data.country,
          city: data.city,
          gender: data.gender,
          phone: data.phone,
        }
      );
      
      dispatch(registerSuccess(userData));
      toast.success("Registration successful!");
      navigate("/");
    } catch (error: any) {
      setLoading(false);
      const errorMessage = error.message || "Registration failed. Please try again.";
      dispatch(registerFailure(errorMessage));
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Handle country selection
  const handleCountryChange = (value: string) => {
    setSelectedCountry(value);
    form.setValue("country", value);
    form.setValue("city", ""); // Reset city when country changes
    setCities([]); // Clear cities when country changes
    setCountryOpen(false);
  };

  // Handle city selection
  const handleCityChange = (value: string) => {
    form.setValue("city", value);
    setCityOpen(false);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Create an account</CardTitle>
        <CardDescription>
          Enter your details to create your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input 
                        placeholder="johndoe" 
                        {...field} 
                        onBlur={(e) => {
                          field.onBlur();
                          validateUsername(e.target.value);
                        }} 
                        onChange={(e) => {
                          field.onChange(e);
                          // Clear any manual errors when user types
                          if (form.formState.errors.username?.type === 'manual') {
                            form.clearErrors("username");
                          }
                        }}
                        disabled={checkingUsername}
                      />
                      {checkingUsername && (
                        <div className="absolute top-0 right-2 flex items-center h-full">
                          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                        </div>
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input 
                        placeholder="email@example.com" 
                        {...field} 
                        onBlur={(e) => {
                          field.onBlur();
                          validateEmail(e.target.value);
                        }} 
                        onChange={(e) => {
                          field.onChange(e);
                          // Clear any manual errors when user types
                          if (form.formState.errors.email?.type === 'manual') {
                            form.clearErrors("email");
                          }
                        }}
                        disabled={checkingEmail}
                      />
                      {checkingEmail && (
                        <div className="absolute top-0 right-2 flex items-center h-full">
                          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                        </div>
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="********" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="********" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Country</FormLabel>
                    <Popover open={countryOpen} onOpenChange={setCountryOpen}>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            role="combobox"
                            className={cn(
                              "justify-between",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {loadingCountries ? (
                              <div className="flex items-center">
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Loading countries...
                              </div>
                            ) : field.value ? (
                              field.value
                            ) : (
                              "Select country"
                            )}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0">
                        <Command>
                          <CommandInput
                            placeholder="Search country..." 
                            className="h-9"
                            value={countrySearchValue}
                            onValueChange={setCountrySearchValue}
                          />
                          <CommandEmpty>No country found.</CommandEmpty>
                          <CommandList>
                            <CommandGroup className="max-h-60 overflow-auto">
                              {countries.map((country) => (
                                <CommandItem
                                  key={country.code}
                                  value={country.name}
                                  onSelect={() => handleCountryChange(country.name)}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      field.value === country.name
                                        ? "opacity-100"
                                        : "opacity-0"
                                    )}
                                  />
                                  {country.name}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>City</FormLabel>
                    {cities.length > 0 ? (
                      <Popover open={cityOpen} onOpenChange={setCityOpen}>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              role="combobox"
                              disabled={!selectedCountry || loadingCities}
                              className={cn(
                                "justify-between",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {loadingCities ? (
                                <div className="flex items-center">
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Loading cities...
                                </div>
                              ) : !selectedCountry ? (
                                "Select country first"
                              ) : field.value ? (
                                field.value
                              ) : (
                                "Select city"
                              )}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0">
                          <Command>
                            <CommandInput placeholder="Search city..." className="h-9" />
                            <CommandEmpty>No city found.</CommandEmpty>
                            <CommandList>
                              <CommandGroup className="max-h-60 overflow-auto">
                                {cities.map((city) => (
                                  <CommandItem
                                    key={city.name}
                                    value={city.name}
                                    onSelect={() => handleCityChange(city.name)}
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        field.value === city.name
                                          ? "opacity-100"
                                          : "opacity-0"
                                      )}
                                    />
                                    {city.name}
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    ) : (
                      <FormControl>
                        <Input 
                          placeholder="Enter city name" 
                          {...field} 
                          disabled={!selectedCountry || loadingCities}
                        />
                      </FormControl>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gender</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="+1 234 567 8900" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading || checkingUsername || checkingEmail}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                "Register"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <div className="text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-primary underline-offset-4 hover:underline"
          >
            Login
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
};
