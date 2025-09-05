import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { supabase, isSupabaseConfigured } from "@/lib/supabaseClient";
import { useEffect } from "react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";

const schema = z.object({
  name: z.string().min(1, "Required"),
  headline: z.string().min(1, "Required"),
  bio: z.string().min(1, "Required"),
  website: z.string().url().optional().or(z.literal("")),
  github: z.string().url().optional().or(z.literal("")),
  twitter: z.string().url().optional().or(z.literal("")),
  linkedin: z.string().url().optional().or(z.literal("")),
});

export default function AdminProfile() {
  const { user } = useAuth();
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      headline: "",
      bio: "",
      website: "",
      github: "",
      twitter: "",
      linkedin: "",
    },
  });

  useEffect(() => {
    if (!user || !isSupabaseConfigured) return;
    // Fetch profile for current admin user
    const load = async () => {
      const { data, error } = await supabase
        .from("profile")
        .select("*")
        .eq("owner", user.id)
        .single();
      if (error && error.code !== "PGRST116") {
        toast.error(error.message);
        return;
      }
      if (data) {
        form.reset({
          name: data.name ?? "",
          headline: data.headline ?? "",
          bio: data.bio ?? "",
          website: data.website ?? "",
          github: data.github ?? "",
          twitter: data.twitter ?? "",
          linkedin: data.linkedin ?? "",
        });
      }
    };
    load();
  }, [form, user]);

  const onSubmit = async (values: z.infer<typeof schema>) => {
    if (!user && isSupabaseConfigured) return;

    if (!isSupabaseConfigured) {
      // Local mode: persist to localStorage for homepage consumption
      localStorage.setItem('local_profile', JSON.stringify(values));
      toast.success("Profile saved (local mode)");
      return;
    }

    const { error } = await supabase
      .from("profile")
      .upsert({ owner: user!.id, ...values }, { onConflict: "owner" });
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Profile saved");
  };

  const logout = async () => {
    if (!isSupabaseConfigured) {
      localStorage.removeItem("local_admin");
      toast.success("Signed out (local)");
      window.location.assign("/admin/login");
      return;
    }
    await supabase.auth.signOut();
    toast.success("Signed out");
    window.location.assign("/admin/login");
  };

  return (
    <div className="min-h-screen p-4">
      <div className="flex justify-between items-center max-w-3xl mx-auto mb-4">
        <h1 className="text-xl font-semibold">Admin: Profile</h1>
        <Button variant="secondary" onClick={logout}>Sign out</Button>
      </div>

      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>Edit Profile</CardTitle>
          <CardDescription>Update your public details</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Your name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="headline"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Headline</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Frontend Engineer" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bio</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Short bio" rows={5} {...field} />
                    </FormControl>
                    <FormDescription>Markdown not supported yet</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(["website", "github", "twitter", "linkedin"] as const).map((k) => (
                  <FormField
                    key={k}
                    control={form.control}
                    name={k}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="capitalize">{k}</FormLabel>
                        <FormControl>
                          <Input placeholder={`https://${k}.com/...`} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ))}
              </div>

              <div className="flex gap-2">
                <Button type="submit">Save</Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}