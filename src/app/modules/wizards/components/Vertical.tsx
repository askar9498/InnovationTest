import { useEffect, useRef, useState } from "react";
import { KTIcon } from "../../../../_metronic/helpers";
import { Step1 } from "./steps/Step1";
import { Step2 } from "./steps/Step2";
import { Step3 } from "./steps/Step3";
import { Step4 } from "./steps/Step4";
import { Step5 } from "./steps/Step5";
import { StepperComponent } from "../../../../_metronic/assets/ts/components";
import { Form, Formik, FormikValues } from "formik";
import {
  createAccountSchemas,
  ICreateAccount,
  inits,
} from "./CreateAccountWizardHelper";
import { Toolbar } from "../../../../_metronic/layout/components/toolbar/Toolbar";
import { Content } from "../../../../_metronic/layout/components/Content";
import { MixedWidget7 } from "../../../../_metronic/partials/widgets";

const Vertical = () => {
  const stepperRef = useRef<HTMLDivElement | null>(null);
  const [stepper, setStepper] = useState<StepperComponent | null>(null);
  const [currentSchema, setCurrentSchema] = useState(createAccountSchemas[0]);
  const [initValues] = useState<ICreateAccount>(inits);

  const loadStepper = () => {
    setStepper(
      StepperComponent.createInsance(stepperRef.current as HTMLDivElement)
    );
  };

  const prevStep = () => {
    if (!stepper) {
      return;
    }

    stepper.goPrev();

    setCurrentSchema(createAccountSchemas[stepper.currentStepIndex - 1]);
  };

  const submitStep = (values: ICreateAccount, actions: FormikValues) => {
    if (!stepper) {
      return;
    }

    if (stepper.currentStepIndex !== stepper.totalStepsNumber) {
      stepper.goNext();
    } else {
      stepper.goto(1);
      actions.resetForm();
    }

    console.log(values);

    setCurrentSchema(createAccountSchemas[stepper.currentStepIndex - 1]);
  };

  useEffect(() => {
    if (!stepperRef.current) {
      return;
    }

    loadStepper();
  }, [stepperRef]);

  return (
    <>
      <div dir="rtl" style={{ fontFamily: "sans" }}>
        {/* <Toolbar /> */}
        <MixedWidget7
          className="card-xl-stretch mb-xl-8"
          chartColor="primary"
          chartHeight="200px"
        ></MixedWidget7>
        <Content>
          <div
            ref={stepperRef}
            className="stepper stepper-pills stepper-column d-flex flex-column flex-xl-row flex-row-fluid"
            id="kt_create_account_stepper"
            dir="rtl"
          >
            {/* begin::Aside*/}
            <div className="card d-flex justify-content-center justify-content-xl-start flex-row-auto w-100 w-xl-300px w-xxl-400px me-9">
              {/* begin::Wrapper*/}
              <div className="card-body px-6 px-lg-10 px-xxl-15 py-20">
                {/* begin::Nav*/}
                <div className="stepper-nav">
                  {/* begin::Step 1*/}
                  <div
                    className="stepper-item current"
                    data-kt-stepper-element="nav"
                  >
                    {/* begin::Wrapper*/}
                    <div className="stepper-wrapper">
                      {/* begin::Icon*/}
                      <div className="stepper-icon w-40px h-40px">
                        <i className="stepper-check fas fa-check"></i>
                        <span className="stepper-number">1</span>
                      </div>
                      {/* end::Icon*/}

                      {/* begin::Label*/}
                      <div className="stepper-label">
                        <h3 className="stepper-title">نوع حساب کاربری</h3>

                        <div className="stepper-desc fw-semibold">
                          تنظیم جزئیات حساب کاربری
                        </div>
                      </div>
                      {/* end::Label*/}
                    </div>
                    {/* end::Wrapper*/}

                    {/* begin::Line*/}
                    <div className="stepper-line h-40px"></div>
                    {/* end::Line*/}
                  </div>
                  {/* end::Step 1*/}

                  {/* begin::Step 2*/}
                  <div className="stepper-item" data-kt-stepper-element="nav">
                    {/* begin::Wrapper*/}
                    <div className="stepper-wrapper">
                      {/* begin::Icon*/}
                      <div className="stepper-icon w-40px h-40px">
                        <i className="stepper-check fas fa-check"></i>
                        <span className="stepper-number">2</span>
                      </div>
                      {/* end::Icon*/}

                      {/* begin::Label*/}
                      <div className="stepper-label">
                        <h3 className="stepper-title">تنظیمات حساب</h3>
                        <div className="stepper-desc fw-semibold">
                          تنظیم تنظیمات حساب کاربری
                        </div>
                      </div>
                      {/* end::Label*/}
                    </div>
                    {/* end::Wrapper*/}

                    {/* begin::Line*/}
                    <div className="stepper-line h-40px"></div>
                    {/* end::Line*/}
                  </div>
                  {/* end::Step 2*/}

                  {/* begin::Step 3*/}
                  <div className="stepper-item" data-kt-stepper-element="nav">
                    {/* begin::Wrapper*/}
                    <div className="stepper-wrapper">
                      {/* begin::Icon*/}
                      <div className="stepper-icon w-40px h-40px">
                        <i className="stepper-check fas fa-check"></i>
                        <span className="stepper-number">3</span>
                      </div>
                      {/* end::Icon*/}

                      {/* begin::Label*/}
                      <div className="stepper-label">
                        <h3 className="stepper-title">اطلاعات کسب و کار</h3>
                        <div className="stepper-desc fw-semibold">
                          اطلاعات مرتبط با کسب و کار شما
                        </div>
                      </div>
                      {/* end::Label*/}
                    </div>
                    {/* end::Wrapper*/}

                    {/* begin::Line*/}
                    <div className="stepper-line h-40px"></div>
                    {/* end::Line*/}
                  </div>
                  {/* end::Step 3*/}

                  {/* begin::Step 4*/}
                  <div className="stepper-item" data-kt-stepper-element="nav">
                    {/* begin::Wrapper*/}
                    <div className="stepper-wrapper">
                      {/* begin::Icon*/}
                      <div className="stepper-icon w-40px h-40px">
                        <i className="stepper-check fas fa-check"></i>
                        <span className="stepper-number">4</span>
                      </div>
                      {/* end::Icon*/}

                      {/* begin::Label*/}
                      <div className="stepper-label">
                        <h3 className="stepper-title">جزئیات پرداخت</h3>
                        <div className="stepper-desc fw-semibold">
                          تنظیم روش‌های پرداخت
                        </div>
                      </div>
                      {/* end::Label*/}
                    </div>
                    {/* end::Wrapper*/}

                    {/* begin::Line*/}
                    <div className="stepper-line h-40px"></div>
                    {/* end::Line*/}
                  </div>
                  {/* end::Step 4*/}

                  {/* begin::Step 5*/}
                  <div className="stepper-item" data-kt-stepper-element="nav">
                    {/* begin::Wrapper*/}
                    <div className="stepper-wrapper">
                      {/* begin::Icon*/}
                      <div className="stepper-icon w-40px h-40px">
                        <i className="stepper-check fas fa-check"></i>
                        <span className="stepper-number">5</span>
                      </div>
                      {/* end::Icon*/}

                      {/* begin::Label*/}
                      <div className="stepper-label">
                        <h3 className="stepper-title">تکمیل</h3>
                        <div className="stepper-desc fw-semibold">
                          به پایان رسید
                        </div>
                      </div>
                      {/* end::Label*/}
                    </div>
                    {/* end::Wrapper*/}
                  </div>
                  {/* end::Step 5*/}
                </div>
                {/* end::Nav*/}
              </div>
              {/* end::Wrapper*/}
            </div>
            {/* begin::Aside*/}

            <div className="d-flex flex-row-fluid flex-center bg-body rounded">
              <Formik
                validationSchema={currentSchema}
                initialValues={initValues}
                onSubmit={submitStep}
              >
                {() => (
                  <Form
                    className="py-20 w-100 w-xl-700px px-9"
                    noValidate
                    id="kt_create_account_form"
                  >
                    <div className="current" data-kt-stepper-element="content">
                      <Step1 />
                    </div>

                    <div data-kt-stepper-element="content">
                      <Step2 />
                    </div>

                    <div data-kt-stepper-element="content">
                      <Step3 />
                    </div>

                    <div data-kt-stepper-element="content">
                      <Step4 />
                    </div>

                    <div data-kt-stepper-element="content">
                      <Step5 />
                    </div>

                    <div className="d-flex flex-stack pt-10">
                      <div className="mr-2">
                        <button
                          onClick={prevStep}
                          type="button"
                          className="btn btn-lg btn-light-primary me-3"
                          data-kt-stepper-action="previous"
                        >
                          <KTIcon
                            iconName="arrow-right"
                            className="fs-4 me-1"
                          />
                          قبلی
                        </button>
                      </div>

                      <div>
                        <button
                          type="submit"
                          className="btn btn-lg btn-primary me-3"
                        >
                          <span className="indicator-label">
                            {stepper?.currentStepIndex !==
                              (stepper?.totalStepsNumber || 2) - 1 && "ادامه"}
                            {stepper?.currentStepIndex ===
                              (stepper?.totalStepsNumber || 2) - 1 && "ثبت"}
                            <KTIcon
                              iconName="arrow-left"
                              className="fs-3 ms-2 me-0"
                            />
                          </span>
                        </button>
                      </div>
                    </div>
                  </Form>
                )}
              </Formik>
            </div>
          </div>
        </Content>
      </div>
    </>
  );
};

export { Vertical };
