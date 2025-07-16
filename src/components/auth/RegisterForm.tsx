
import { useEffect, useState } from "react";

import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  registerFailure,
  registerStart,
  registerSuccess,
} from "@/features/auth/authSlice";
import { useToast } from "@/hooks/use-toast";
import { useAppDispatch } from "@/lib/hooks";
import { signUp } from "@/services/authService";
import { zodResolver } from "@hookform/resolvers/zod";

const registerSchema = z
  .object({
    username: z.string().min(3, "Username must be at least 3 characters"),
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
    country: z.string().min(1, "Please select your country"),
    city: z.string().min(1, "Please select your city"),
    gender: z.string().min(1, "Please select your gender"),
    phone: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
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
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState("");
  const [countries, setCountries] = useState<Country[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [loadingCountries, setLoadingCountries] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);

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
        const response = await fetch(
          "https://restcountries.com/v3.1/all?fields=name,flags,cca2",
        );
        const data = await response.json();

        const formattedCountries = data
          .map((country: { cca2: string; name: { common: string } }) => ({
            code: country.cca2,
            name: country.name.common,
          }))
          .sort((a: Country, b: Country) => a.name.localeCompare(b.name));
        setCountries(formattedCountries);
      } catch (error) {
        const err = error as Error;
        console.error("Failed to fetch countries:", err);
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
        const response = await fetch(
          "https://countriesnow.space/api/v0.1/countries/cities",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ country: selectedCountry }),
          },
        );
        const data = await response.json();
        if (data?.data?.length > 0) {
          setCities(data?.data?.map((city: string) => ({ name: city })));
        } else {
          setCities([]);
        }
      } catch (error) {
        console.error("Failed to fetch cities:", error);
      } finally {
        setLoadingCities(false);
      }
    };

    fetchCities();
  }, [selectedCountry]);

  const onSubmit = async (data: RegisterFormValues) => {
    try {
      setLoading(true);
      dispatch(registerStart());

      const userData = await signUp({
        email: data.email,
        password: data.password,
        username: data.username,
        full_name: data.username,
        country: data.country,
        city: data.city,
        gender: data.gender,
        phone_number: data.phone,
      });

      dispatch(registerSuccess(userData));
      navigate("/my-exams");
    } catch (error) {
      const err = error as Error;
    
      let errorMessage = "Registration failed. Please try again.";
    
      if (err.message.includes("User already registered")) {
        errorMessage =
          "This email is already registered. Please use a different email.";
      } else if (err.message) {
        errorMessage = err.message;
      }
    
      console.error("Registration error:", err);
      dispatch(registerFailure(errorMessage));
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle country change
  const handleCountryChange = (value: string) => {
    setSelectedCountry(value);
    form.setValue("city", ""); // Reset city when country changes
    setCities([]); // Clear cities when country changes
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Create an account</CardTitle>
        <CardDescription>
          Registration is currently disabled. Please contact an administrator for account access.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center p-8 text-muted-foreground">
          <p>Account creation is managed by administrators.</p>
          <p className="mt-2">Please contact support to request access.</p>
        </div>
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
