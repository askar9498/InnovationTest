/* eslint-disable react-hooks/exhaustive-deps */
import { FC, useEffect, useState } from "react";
import { KTIcon, useDebounce } from "../../../../../../../_metronic/helpers";
import { searchUser } from "../../../../../auth/core/_requests";
import { UserResponse } from "../../../../../../../_metronic/partials/widgets";

type Props = {
  placeHolder: string;
  onSearchResult: (users: UserResponse) => void;
};

const PostListSearchComponent: FC<Props> = ({
  placeHolder,
  onSearchResult,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  useEffect(() => {
    const fetchSearchResults = async () => {
      try {
        const response = await searchUser(debouncedSearchTerm!.toString());
        const result = response.data as UserResponse;
        onSearchResult(result);
      } catch (error) {
        console.error("Search error:", error);
      }
    };

    fetchSearchResults();
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

export { PostListSearchComponent };
