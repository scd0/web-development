import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "react-router-dom";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ModeToggle } from "@/components/ui/mode-toggle";

const formSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(8, { message: "Password must be at least 8 characters long, including at least 1 number and 1 symbol." }),
});

export const SignIn = () => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });
 
  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values)
  }

  useEffect(() => {
    document.title = "Parallel • Sign In";
  }, []);

  return (
    <section className="size-full flex justify-center items-center">
      <div className="w-[300px] flex flex-col items-center justify-center">
        <p style={{ fontFamily: "Oleo Script" }} className="text-4xl flex items-center mb-4">Parallel<span className="ml-2 font-sans font-extralight text-2xl">•<span className="ml-2">Sign in</span></span></p>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-1">
            <FormField control={form.control} name="email" render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input required placeholder=". . ." type="email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="password" render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input required placeholder=". . ." type="password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <p className="text-xs text-center py-2">Don't have an account? <Link to="/sign-up" className="text-blue-500 hover:underline">Sign up</Link></p>
            <div className="flex justify-between items-center">
              <ModeToggle />
              <Button type="submit">Next</Button>
            </div>
          </form>
        </Form>
      </div>
    </section>
  )
}
