import React, { useState } from "react";
import { getApiUrl } from "../../../../config/api";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

export function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const sendForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    Swal.fire({
      title: "در حال ارسال درخواست...",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
      heightAuto: false,
    });
    try {
      const response = await fetch(
        getApiUrl("/api/PasswordRecovery/forgot-password"),
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }
      );
      Swal.close();
      if (!response.ok) {
        const msg = await response.text();
        Swal.fire({
          icon: "error",
          title: "خطا",
          text: msg || "ارسال ایمیل با خطا مواجه شد",
          heightAuto: false,
        });
      } else {
        Swal.fire({
          icon: "success",
          title: "موفق",
          text: "رمز عبور جدید به ایمیل شما ارسال شد",
          heightAuto: false,
        });
        setTimeout(() => navigate("/login"), 1500);
      }
    } catch (e) {
      Swal.close();
      Swal.fire({
        icon: "error",
        title: "خطا",
        text: "خطا در ارتباط با سرور",
        heightAuto: false,
      });
    }
    setLoading(false);
  };

  return (
    <form
      className="form w-100 "
      onSubmit={sendForgotPassword}
      dir="rtl"
      style={{
        maxWidth: 400,
        margin: "auto",
        marginTop: 60,
        fontFamily: "sans",
      }}
    >
      <div className="text-center mb-11">
        <h1 className="text-gray-900 fw-bolder mb-3">فراموشی رمز عبور</h1>
        <div className="text-muted fs-6">
          ایمیل خود را وارد کنید تا رمز عبور جدید برای شما ارسال شود.
        </div>
      </div>

      <div className="fv-row mb-8">
        <label className="form-label fw-bolder text-gray-900 fs-6">ایمیل</label>
        <input
          type="email"
          className="form-control bg-transparent"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      <div className="mb-8 text-center">
        <button
          type="submit"
          className="btn btn-primary w-100"
          disabled={loading || !email}
        >
          ارسال رمز عبور جدید
        </button>
      </div>
    </form>
  );
}
