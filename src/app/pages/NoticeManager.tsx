import { TablesWidget9 } from "../../_metronic/partials/widgets/index.ts";

const NoticeManager = () => {
  return (
    <>
      <TablesWidget9
        className={"w-auto rtl"}
        title={"مدیریت اطلاعیه ها"}
        subTitle={"توضیحات"}
        key={1}
        defaultCategory="Notices"
      />
    </>
  );
};

export default NoticeManager; 