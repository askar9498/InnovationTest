import { TablesWidget9 } from "../../_metronic/partials/widgets/index.ts";

const NewsManager = () => {
  return (
    <>
      <TablesWidget9
        className={"w-auto rtl"}
        title={"مدیریت اخبار"}
        subTitle={"توضیحات"}
        key={1}
        defaultCategory="News"
      />
    </>
  );
};

export default NewsManager; 