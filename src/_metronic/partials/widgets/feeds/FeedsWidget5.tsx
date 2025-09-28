import { FC } from "react";
import { toAbsoluteUrl } from "../../../helpers";

type Props = {
  className: string;
};

const FeedsWidget5: FC<Props> = ({ className }) => {
  return (
    <a href="#">
      <div
        className={`card my-4 ${className}`}
        style={{ fontFamily: "sans" }}
        dir={"rtl"}
      >
        {/* begin::Body */}
        <div className="card-body pb-0">
          <div className="p-3">
            <h2>جذب ایده، طراحی، توسعه و بهره برداری از تکنولوژی بازرسی </h2>
            <h5 className="fw-bolder d-flex align-items-center text-gray-900 mt-5">
              1403/07/20
              <div className="badge badge-warning  fw-bold fs-6 me-5">
                منقضی شده
              </div>
            </h5>
          </div>
          {/* begin::Post */}
          <div className="mb-5">
            {/* begin::Image */}
            <div
              className="bgi-no-repeat bgi-size-cover rounded min-h-250px mb-5"
              style={{
                backgroundImage: `url('${toAbsoluteUrl(
                  "media/stock/900x600/20.jpg"
                )}')`,
              }}
            ></div>
            {/* end::Image */}
            {/* begin::Text */}
            <div className="text-gray-800 mb-5">
              مرکز نوآوری ﺷﺮﻛﺖ پلیمر آریاساسول در ابتدا از تمام شرکت های دانش
              بنیان و نخبگانی که پیشتازان و هموار کنندگان مسیر پیشرفت و توسعه ی
              کشور هستند تشکر نموده و به استحضار می رساند این مرکز ﺩﺭ ﻧﻈﺮ ﺩﺍﺭﺩ
              که ﺑﻪ هدف جذب، غربال گری و انتخاب برترین ایده، طرح یا محصول مربوط
              به فراخوان
            </div>
            {/* end::Text */}
          </div>
          {/* end::Post */}
        </div>
        {/* end::Body */}
      </div>
    </a>
  );
};

export { FeedsWidget5 };
