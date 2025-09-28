import { TablesWidget9 } from "../../_metronic/partials/widgets/index.ts";

const EventManager = () => {
  return (
    <>
      <TablesWidget9
        className={"w-auto rtl"}
        title={"مدیریت رویدادها"}
        subTitle={"توضیحات"}
        key={1}
        defaultCategory="Events"
      />
    </>
  );
};

export default EventManager; 