import { FC, useEffect, useState } from "react";
import { KTIcon, useDebounce } from "../../../../../../../_metronic/helpers";

type Props = {
  placeHolder: string;
  onSearchResult: (searchTerm: string) => void;
};

const BlogSearchComponent: FC<Props> = ({
  placeHolder,
  onSearchResult,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  useEffect(() => {
    if (debouncedSearchTerm) {
      onSearchResult(debouncedSearchTerm);
    }
  }, [debouncedSearchTerm]);

  return (
    <div className="card-title" dir="rtl">
      <div className="d-flex align-items-center position-relative my-1">
        <KTIcon iconName="magnifier" className="fs-1 position-absolute me-6" />
        <input
          type="text"
          className="form-control form-control-solid w-250px pe-14"
          placeholder={placeHolder}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
    </div>
  );
};

export { BlogSearchComponent }; 