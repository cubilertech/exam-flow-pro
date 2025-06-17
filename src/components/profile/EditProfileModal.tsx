import { useEffect, useState } from "react";

import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateProfileSuccess } from "@/features/auth/authSlice";
import { supabase } from "@/integrations/supabase/client";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

interface EditProfileFormData {
  username: string;
  country: string;
  gender: string;
  phone: string;
  city: string;
}

interface Country {
  code: string;
  name: string;
}

interface City {
  name: string;
}

interface EditProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditProfileModal({
  open,
  onOpenChange,
}: EditProfileModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingCountries, setLoadingCountries] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);
  const [countries, setCountries] = useState<Country[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [selectedCountry, setSelectedCountry] = useState("");

  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();

  const { register, handleSubmit, control, setValue, watch } =
    useForm<EditProfileFormData>({
      defaultValues: {
        username: user?.username || "",
        country: user?.country || "",
        gender: user?.gender || "",
        phone: user?.phone || "",
        city: user?.city || "",
      },
    });

  // Watch country field to trigger city fetch
  const watchCountry = watch("country");

  // Fetch countries on component mount
  useEffect(() => {
    const fetchCountries = async () => {
      setLoadingCountries(true);
      try {
        const response = await fetch(
          "https://restcountries.com/v3.1/all?fields=name,flags,cca2",
        );
        const data = await response.json();

        const formattedCountries = data
          .map((country: any) => ({
            code: country.cca2,
            name: country.name.common,
          }))
          .sort((a: Country, b: Country) => a.name.localeCompare(b.name));
        setCountries(formattedCountries);

        // If user has a country, set it as selected
        if (user?.country) {
          setSelectedCountry(user.country);
        }
      } catch (error) {
        console.error("Failed to fetch countries:", error);
        toast.error("Failed to load countries. Please try again later.");
      } finally {
        setLoadingCountries(false);
      }
    };

    fetchCountries();
  }, [user?.country]);

  // Fetch cities when country changes
  useEffect(() => {
    const fetchCities = async () => {
      if (!watchCountry) return;

      setLoadingCities(true);
      try {
        const response = await fetch(
          "https://countriesnow.space/api/v0.1/countries/cities",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ country: watchCountry }),
          },
        );
        const data = await response.json();

        if (data?.data?.length > 0) {
          setCities(data.data.map((city: any) => ({ name: city })));
        } else {
          setCities([]);
        }
      } catch (error) {
        console.error("Failed to fetch cities:", error);
        toast.error("Failed to load cities for selected country.");
      } finally {
        setLoadingCities(false);
      }
    };

    fetchCities();
  }, [watchCountry]);

  const onSubmit = async (data: EditProfileFormData) => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          username: data.username,
          country: data.country,
          gender: data.gender,
          phone_number: data.phone,
          city: data.city,
        })
        .eq("id", user.id);

      if (error) throw error;

      dispatch(
        updateProfileSuccess({
          username: data.username,
          country: data.country,
          gender: data.gender,
          phone: data.phone,
          city: data.city,
        }),
      );

      toast.success("Profile updated successfully");
      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to update profile");
      console.error("Error updating profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input id="username" {...register("username")} />
          </div>

          {/* Country Select */}
          <div className="space-y-2">
            <Label>Country</Label>
            <Select
              onValueChange={(value) => {
                setValue("country", value);
                setSelectedCountry(value);
                setValue("city", ""); // Reset city when country changes
              }}
              value={watchCountry}
              disabled={loadingCountries}
            >
              <SelectTrigger>
                {loadingCountries ? (
                  <div className="flex items-center">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading countries...
                  </div>
                ) : (
                  <SelectValue placeholder="Select country" />
                )}
              </SelectTrigger>
              <SelectContent>
                {countries.map((country) => (
                  <SelectItem key={country.code} value={country.name}>
                    {country.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* City Select */}
          <div className="space-y-2">
            <Label>City</Label>
            <Select
              onValueChange={(value) => setValue("city", value)}
              value={watch("city")}
              disabled={!watchCountry || loadingCities}
            >
              <SelectTrigger>
                {loadingCities ? (
                  <div className="flex items-center">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading cities...
                  </div>
                ) : !watchCountry ? (
                  "Select country first"
                ) : (
                  <SelectValue placeholder="Select city" />
                )}
              </SelectTrigger>
              <SelectContent className="max-h-[300px]">
                {cities.map((city) => (
                  <SelectItem key={city.name} value={city.name}>
                    {city.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Gender Select */}
          <div className="space-y-2">
            <Label>Gender</Label>
            <Select
              onValueChange={(value) => setValue("gender", value)}
              value={watch("gender")}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" {...register("phone")} />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              type="button"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLoading ? "Updating..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
