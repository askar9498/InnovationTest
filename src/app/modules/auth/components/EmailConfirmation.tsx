import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getApiUrl } from "../../../../config/api";
import Swal from "sweetalert2";

export function EmailConfirmation() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState(
    location.state?.email || localStorage.getItem("pendingEmail") || ""
  );
  const [code, setCode] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [codeSent, setCodeSent] = useState(false);

  const sendCode = async () => {
    setLoading(true);
    Swal.fire({
      title: "در حال ارسال کد...",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });
    try {
      const response = await fetch(getApiUrl("/api/EmailConfirmation/send-code"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(email),
      });
      Swal.close();
      if (!response.ok) {
        const msg = await response.text();
        Swal.fire({ icon: "error", title: "خطا", text: msg || "ارسال کد با خطا مواجه شد" });
      } else {
        Swal.fire({ icon: "success", title: "موفق", text: "کد تایید به ایمیل شما ارسال شد" });
        setCodeSent(true);
        localStorage.setItem("pendingEmail", email);
      }
    } catch (e) {
      Swal.close();
      Swal.fire({ icon: "error", title: "خطا", text: "خطا در ارتباط با سرور" });
    }
    setLoading(false);
  };

  const confirmCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    Swal.fire({
      title: "در حال تایید...",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });
    try {
      const response = await fetch(getApiUrl("/api/EmailConfirmation/confirm"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });
      Swal.close();
      if (!response.ok) {
        const msg = await response.text();
        Swal.fire({ icon: "error", title: "خطا", text: msg || "کد نامعتبر یا منقضی شده است" });
      } else {
        Swal.fire({ icon: "success", title: "ایمیل تایید شد", text: "اکنون می‌توانید وارد شوید" });
        localStorage.removeItem("pendingEmail");
        setTimeout(() => navigate("/login"), 1500);
      }
    } catch (e) {
      Swal.close();
      Swal.fire({ icon: "error", title: "خطا", text: "خطا در ارتباط با سرور" });
    }
    setLoading(false);
  };

  return (
    <form
      className="form w-100 fv-plugins-bootstrap5 fv-plugins-framework"
      onSubmit={confirmCode}
      dir="rtl"
      style={{ maxWidth: 400, margin: "auto", marginTop: 60 }}
    >
      <div className="text-center mb-11">
        <h1 className="text-gray-900 fw-bolder mb-3">تایید ایمیل</h1>
        <div className="text-muted fs-6">
          لطفا ایمیل خود را وارد کنید و کد ارسال شده را تایید نمایید.
        </div>
      </div>

      <div className="fv-row mb-8">
        <label className="form-label fw-bolder text-gray-900 fs-6">ایمیل</label>
        <input
          type="email"
          className="form-control bg-transparent"
          value={email}
          onChange={e => setEmail(e.target.value)}
          disabled={codeSent}
          required
        />
      </div>

      {!codeSent && (
        <div className="mb-8 text-center">
          <button
            type="button"
            className="btn btn-primary w-100"
            onClick={sendCode}
            disabled={loading || !email}
          >
            ارسال کد تایید
          </button>
        </div>
      )}

      {codeSent && (
        <>
          <div className="fv-row mb-8">
            <label className="form-label fw-bolder text-gray-900 fs-6">
              کد تایید ارسال شده به ایمیل
            </label>
            <input
              type="text"
              className="form-control bg-transparent"
              value={code}
              onChange={e => setCode(e.target.value)}
              required
            />
          </div>
          <div className="mb-8 text-center">
            <button
              type="submit"
              className="btn btn-success w-100"
              disabled={loading || !code}
            >
              تایید ایمیل
            </button>
          </div>
          <div className="mb-4 text-center">
            <button
              type="button"
              className="btn btn-link"
              onClick={sendCode}
              disabled={loading}
            >
              ارسال مجدد کد
            </button>
          </div>
        </>
      )}

      {status && (
        <div className={`alert ${status.includes("موفق") ? "alert-success" : "alert-danger"}`}>
          {status}
        </div>
      )}
    </form>
  );
} 