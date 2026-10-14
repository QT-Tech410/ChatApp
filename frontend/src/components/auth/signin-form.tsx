import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Label } from "../ui/label";
import { useAuthStore } from "@/stores/useAuthStore";
import { useNavigate, Link } from "react-router";

const signInSchema = z.object({
  username: z.string().min(3, "Tên đăng nhập phải có ít nhất 3 ký tự"),
  password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
});

type SignInFormValues = z.infer<typeof signInSchema>;

export function SigninForm({ className, ...props }: React.ComponentProps<"div">) {
  const { signIn } = useAuthStore();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
  });

  const onSubmit = async (data: SignInFormValues) => {
    const { username, password } = data;
    await signIn(username, password);
    navigate("/");
  };

  return (
    <div
      className={cn("flex flex-col gap-6", className)}
      {...props}
    >
      <Card className="overflow-hidden p-0 border border-border shadow-md rounded-2xl bg-card">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form
            className="p-6 md:p-8"
            onSubmit={handleSubmit(onSubmit)}
          >
            <div className="flex flex-col gap-6">
              {/* Header - logo */}
              <div className="flex flex-col items-center text-center gap-2">
                <Link
                  to="/"
                  className="mx-auto block w-fit text-center"
                >
                  <img
                    src="/logo.svg"
                    alt="logo"
                    className="size-10"
                  />
                </Link>

                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                  Chào mừng quay lại
                </h1>
                <p className="text-muted-foreground text-sm">
                  Đăng nhập vào tài khoản ChatApp của bạn
                </p>
              </div>

              {/* Username */}
              <div className="flex flex-col gap-2">
                <Label
                  htmlFor="username"
                  className="block text-sm font-medium"
                >
                  Tên đăng nhập
                </Label>
                <Input
                  type="text"
                  id="username"
                  placeholder="Nhập tên đăng nhập"
                  autoComplete="username"
                  {...register("username")}
                />
                {errors.username && (
                  <p className="text-destructive text-xs font-medium mt-1">
                    {errors.username.message}
                  </p>
                )}
              </div>

              {/* Password */}
              <div className="flex flex-col gap-2">
                <Label
                  htmlFor="password"
                  className="block text-sm font-medium"
                >
                  Mật khẩu
                </Label>
                <Input
                  type="password"
                  id="password"
                  autoComplete="current-password"
                  placeholder="Nhập mật khẩu"
                  {...register("password")}
                />
                {errors.password && (
                  <p className="text-destructive text-xs font-medium mt-1">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Nút đăng nhập */}
              <Button
                type="submit"
                className="w-full h-10 font-semibold"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Đang đăng nhập..." : "Đăng nhập"}
              </Button>

              <div className="text-center text-sm text-muted-foreground">
                Chưa có tài khoản?{" "}
                <Link
                  to="/signup"
                  className="font-semibold text-primary underline-offset-4 hover:underline"
                >
                  Đăng ký ngay
                </Link>
              </div>
            </div>
          </form>

          {/* Branding Banner Side */}
          <div className="bg-muted/40 relative hidden md:flex flex-col justify-between p-8 border-l border-border/50">
            <div className="space-y-2">
              <div className="size-9 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold text-base shadow-xs select-none">
                CA
              </div>
              <h2 className="text-xl font-bold text-foreground tracking-tight">
                ChatApp
              </h2>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Nền tảng nhắn tin thời gian thực với tốc độ xử lý cao, bảo mật dữ liệu và giao diện tối giản.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-card border border-border/60 shadow-2xs space-y-1">
              <p className="text-xs font-medium text-foreground">
                "Kết nối tức thì, trao đổi mượt mà."
              </p>
              <p className="text-[11px] text-muted-foreground">
                Tin nhắn và tệp tin của bạn luôn sẵn sàng và an toàn.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="text-xs text-balance px-6 text-center text-muted-foreground *:[a]:underline *:[a]:underline-offset-4 *:[a]:hover:text-primary">
        Bằng cách tiếp tục, bạn đồng ý với <a href="#">Điều khoản dịch vụ</a> và{" "}
        <a href="#">Chính sách bảo mật</a> của chúng tôi.
      </div>
    </div>
  );
}
