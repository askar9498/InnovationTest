import { useIntl } from "react-intl";
import { AsideMenuItem } from "./AsideMenuItem";
import { AsideMenuItemWithSub } from "./AsideMenuItemWithSub";
import {
  decryptToJwt,
  getToken,
  PermissionEnums,
} from "../../../../app/modules/auth/core/_requests";

export function AsideMenuMain() {
  const userHasAccess = (permission: number) => {
    try {
      const token = getToken();
      if (!token) return false;

      const data = decryptToJwt(token.toString());
      return data?.Permissions?.includes(permission) || false;
    } catch (error) {
      console.error("Error checking user access:", error);
      return false;
    }
  };

  return (
    <>
      <div dir="rtl" style={{ fontFamily: "sans" }}>
        {/* صفحه خوش آمد حذف شد */}

        {userHasAccess(PermissionEnums.ViewCompleteProfileMenu) && (
          <AsideMenuItem
            to="/complete-profile"
            icon="user"
            title="تکمیل اطلاعات کاربری"
          />
        )}

        {userHasAccess(PermissionEnums.ViewUserManageMenu) && (
          <AsideMenuItem
            to="/MyUserManage"
            title="مدیریت کاربران"
            icon="element-12"
          />
        )}

        {userHasAccess(PermissionEnums.ViewIdeaSubmissionsMenu) && (
          <AsideMenuItem
            to="/IdeaSubmissionsManage"
            title="مدیریت طرح ها"
            icon="element-12"
          />
        )}

        {userHasAccess(PermissionEnums.ViewMenuManageMenu) && (
          <AsideMenuItemWithSub
            to="/menu-items"
            title="مدیریت منو"
            icon="element-11"
          >
            <AsideMenuItem
              to="/menu-items"
              title="لیست آیتم‌های منو"
              hasBullet={true}
            />
            <AsideMenuItem
              to="/menu-item-editor"
              title="ایجاد آیتم منو جدید"
              hasBullet={true}
            />
          </AsideMenuItemWithSub>
        )}

        {userHasAccess(PermissionEnums.ViewDynamicPagesMenu) && (
          <AsideMenuItemWithSub
            to="/dynamic-pages"
            title="مدیریت صفحات"
            icon="document"
          >
            <AsideMenuItem
              to="/dynamic-pages"
              title="لیست صفحات"
              hasBullet={true}
            />
            <AsideMenuItem
              to="/dynamic-page-editor"
              title="ایجاد صفحه جدید"
              hasBullet={true}
            />
          </AsideMenuItemWithSub>
        )}

        {userHasAccess(PermissionEnums.ViewDynamicPagesMenu) && (
          <AsideMenuItemWithSub
            to="/hero-slides"
            title="مدیریت اسلایدها"
            icon="element-11"
          >
            <AsideMenuItem
              to="/hero-slides"
              title="لیست اسلایدها"
              hasBullet={true}
            />
            <AsideMenuItem
              to="/hero-slides/create"
              title="ایجاد اسلاید جدید"
              hasBullet={true}
            />
          </AsideMenuItemWithSub>
        )}

        {userHasAccess(PermissionEnums.ViewBlogManageMenu) && (
          <AsideMenuItemWithSub
            to="/my-blog-manage"
            title="مدیریت اطلاع رسانی"
            icon="element-7"
          >
            <AsideMenuItem
              to="/news-manager"
              title="مدیریت اخبار"
              hasBullet={true}
            />
            <AsideMenuItem
              to="/edu-manager"
              title="مدیریت اطلاعیه های آموزشی"
              hasBullet={true}
            />
            <AsideMenuItem
              to="/event-manager"
              title="مدیریت رویدادها"
              hasBullet={true}
            />
            <AsideMenuItem
              to="/notice-manager"
              title="مدیریت اطلاعیه ها"
              hasBullet={true}
            />
          </AsideMenuItemWithSub>
        )}

        {userHasAccess(PermissionEnums.ViewInnovationsMenu) && (
          <AsideMenuItem
            to="/innovations"
            title="مدیریت فراخوان ها"
            icon="element-2"
          />
        )}
        <AsideMenuItem
          title="پیشنهادهای من"
          to="/my-idea-submissions"
          icon="element-2"

          //hasArrow={false}
          //menuPlacement='bottom-start'
          //menuTrigger='click'
        />
        {userHasAccess(PermissionEnums.ViewContactUsMenu) && (
          <AsideMenuItem
            to="/contact-us-manage"
            title="مدیریت تماس با ما"
            icon="element-2"
          />
        )}

        {userHasAccess(PermissionEnums.ViewTicketGroupsMenu) && (
          <AsideMenuItem
            to="/ticket-groups"
            title="مدیریت گروه های تیکت"
            icon="element-2"
          />
        )}

        {userHasAccess(PermissionEnums.ViewSupportMenu) && (
          <AsideMenuItem
            to="/support"
            title="مدیریت پشتیبانی"
            icon="element-2"
          />
        )}

        {userHasAccess(PermissionEnums.ViewUserSupportMenu) && (
          <AsideMenuItem
            to="/usersupport"
            title="واحد پشتیبانی کاربر"
            icon="element-2"
          />
        )}
      </div>
    </>
  );
}
