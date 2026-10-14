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

const signUpSchema = z.object({
  firstname: z.string().min(1, "Tên bắt buộc phải có"),
  lastname: z.string().min(1, "Họ bắt buộc phải có"),
  username: z.string().min(3, "Tên đăng nhập phải có ít nhất 3 ký tự"),
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
});

type SignUpFormValues = z.infer<typeof signUpSchema>;

export function SignupForm({ className, ...props }: React.ComponentProps<"div">) {
  const { signUp } = useAuthStore();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
  });

  const onSubmit = async (data: SignUpFormValues) => {
    const { firstname, lastname, username, email, password } = data;
    await signUp(username, password, email, firstname, lastname);
    navigate("/signin");
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
            <div className="flex flex-col gap-5">
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
                  Tạo tài khoản
                </h1>
                <p className="text-muted-foreground text-sm">
                  Đăng ký tài khoản để bắt đầu trò chuyện ngay
                </p>
              </div>

              {/* Họ & Tên */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label
                    htmlFor="lastname"
                    className="block text-sm font-medium"
                  >
                    Họ
                  </Label>
                  <Input
                    type="text"
                    id="lastname"
                    placeholder="Nguyễn"
                    {...register("lastname")}
                  />
                  {errors.lastname && (
                    <p className="text-destructive text-xs font-medium mt-1">
                      {errors.lastname.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label
                    htmlFor="firstname"
                    className="block text-sm font-medium"
                  >
                    Tên
                  </Label>
                  <Input
                    type="text"
                    id="firstname"
                    placeholder="Văn A"
                    {...register("firstname")}
                  />
                  {errors.firstname && (
                    <p className="text-destructive text-xs font-medium mt-1">
                      {errors.firstname.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Username */}
              <div className="space-y-1.5">
                <Label
                  htmlFor="username"
                  className="block text-sm font-medium"
                >
                  Tên đăng nhập
                </Label>
                <Input
                  type="text"
                  id="username"
                  autoComplete="username"
                  placeholder="nguyenvana"
                  {...register("username")}
                />
                {errors.username && (
                  <p className="text-destructive text-xs font-medium mt-1">
                    {errors.username.message}
                  </p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <Label
                  htmlFor="email"
                  className="block text-sm font-medium"
                >
                  Email
                </Label>
                <Input
                  type="email"
                  id="email"
                  autoComplete="email"
                  placeholder="name@example.com"
                  {...register("email")}
                />
                {errors.email && (
                  <p className="text-destructive text-xs font-medium mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <Label
                  htmlFor="password"
                  className="block text-sm font-medium"
                >
                  Mật khẩu
                </Label>
                <Input
                  type="password"
                  id="password"
                  autoComplete="new-password"
                  placeholder="Tối thiểu 6 ký tự"
                  {...register("password")}
                />
                {errors.password && (
                  <p className="text-destructive text-xs font-medium mt-1">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Nút đăng ký */}
              <Button
                type="submit"
                className="w-full h-10 font-semibold"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Đang tạo tài khoản..." : "Tạo tài khoản"}
              </Button>

              <div className="text-center text-sm text-muted-foreground">
                Đã có tài khoản?{" "}
                <Link
                  to="/signin"
                  className="font-semibold text-primary underline-offset-4 hover:underline"
                >
                  Đăng nhập
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
                Gia nhập ChatApp
              </h2>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Tạo tài khoản miễn phí để kết nối với bạn bè, trò chuyện nhóm và chia sẻ tệp tin tức thì.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-card border border-border/60 shadow-2xs space-y-1">
              <p className="text-xs font-medium text-foreground">
                "Bảo mật và riêng tư"
              </p>
              <p className="text-[11px] text-muted-foreground">
                Dữ liệu hội thoại được phân vùng và tối ưu hóa hiệu năng cao.
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
