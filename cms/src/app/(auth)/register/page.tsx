"use client";

import { Eye, EyeOff, PenTool } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../../../components/ui/card";
import { userRegister } from "../../../hooks/useAuth";
import { RegisterFormData, registerSchema } from "../../../lib/zod/authForm";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import Link from "next/link";
import { useState } from "react";
import { Label } from "../../../components/ui/label";
import { Input } from "../../../components/ui/input";

const Register = () => {
  const { mutate: registerHook, isPending, error } = userRegister();
  const [isShowPassword, setIsShowPassword] = useState(false);
  const [isShowConfirmPassword, setIsShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = (data: RegisterFormData) => {
    registerHook(data);
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-col items-center justify-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <div className="bg-primary-500 text-secondary-100 dark:text-secondary-950 p-2 rounded-lg my-4">
              <PenTool />
            </div>
            <p className="text-primary-500 font-extrabold text-3xl dark:text-secondary-100">Blog CMS</p>
          </CardTitle>
          <CardDescription>Create account to write wonderful blogs</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Username */}
            <div>
              <Label htmlFor="username" className="block text-sm font-medium mb-2">
                Username
              </Label>
              <Input
                id="username"
                type="username"
                placeholder="Enter username"
                {...register("username")}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
                  errors.username ? "border-red-500" : "border-gray-300"
                }`}
                disabled={isSubmitting}
              />
              {errors.username && <p className="text-red-500 text-sm mt-1">{errors.username.message}</p>}
            </div>

            {/* Email Field */}
            <div>
              <Label htmlFor="email" className="block text-sm font-medium mb-2">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter email"
                {...register("email")}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
                  errors.email ? "border-red-500" : "border-gray-300"
                }`}
                disabled={isSubmitting}
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
            </div>

            {/* Password Field */}
            <div>
              <Label htmlFor="password" className="block text-sm font-medium mb-2">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={isShowPassword ? "text" : "password"}
                  placeholder="Enter Password"
                  {...register("password")}
                  className={`w-full px-3 py-2 pr-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
                    errors.password ? "border-red-500" : "border-gray-300"
                  }`}
                  disabled={isSubmitting}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full p-0 hover:bg-transparent"
                  onClick={() => setIsShowPassword(prev => !prev)}
                >
                  {isShowPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
            </div>

            {/* Confirm Password */}
            <div>
              <Label htmlFor="confirmPassword" className="block text-sm font-medium mb-2">
                Confirm Password
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={isShowConfirmPassword ? "text" : "password"}
                  placeholder="Confirm Password"
                  {...register("confirmPassword")}
                  className={`w-full px-3 py-2 pr-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
                    errors.confirmPassword ? "border-red-500" : "border-gray-300"
                  }`}
                  disabled={isSubmitting}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full p-0 hover:bg-transparent"
                  onClick={() => setIsShowConfirmPassword(prev => !prev)}
                >
                  {isShowConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>}
            </div>

            {/* User Role */}
            <div className="hidden">
              <Label htmlFor="userRole" className="block text-sm font-medium mb-2">
                User Role
              </Label>
              <select
                id="userRole"
                {...register("userRole")}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
                  errors.userRole ? "border-red-500" : "border-gray-300"
                }`}
                defaultValue="ADMIN"
                disabled={isSubmitting}
              >
                <option value="">Select Role</option>
                <option value="ADMIN">Admin</option>
                <option value="VIEWER">Viewer</option>
              </select>
              {errors.userRole && <p className="text-red-500 text-sm mt-1">{errors.userRole.message}</p>}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isSubmitting}
              size="lg"
              className="w-full bg-primary text-primary-foreground py-2 rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? "Creating Account..." : "Create Account"}
            </Button>
          </form>
        </CardContent>

        <CardFooter>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Register;
