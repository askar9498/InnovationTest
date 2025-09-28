import React, { FC, useEffect, useState } from 'react';
import { getAllTickets, getTicketDetails, sendAdminMessage, SendAdminMessageDto, downloadFileAttachment, closeTicket, getUserUnreadCounts, UserUnreadCountDto, decryptToJwt, getToken, PermissionEnums } from '../../auth/core/_requests';
import Swal from 'sweetalert2'; // Import SweetAlert2
import { useNavigate } from 'react-router-dom'; // Import useNavigate
// Assuming Ticket and Message types are defined or will be defined later
// interface Ticket { id: number; subject: string; status: string; /* ... other fields */ }
// interface Message { id: number; ticketId: number; senderId: number; content: string; createdAt: string; isReadByAdmin: boolean; /* ... other fields */ }

// Define basic types based on the backend structure
interface Message { 
  id: number; 
  ticketId: number; 
  senderId: number; // Assuming 0 is admin, need confirmation
  content: string; 
  createdAt: string; 
  isReadByAdmin: boolean;
  fileAttachmentId?: number | null;
  // Add user details if available in the message object from backend
  sender?: { // Assuming sender details might be included
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    // ... other user fields relevant for display
  };
}

interface Ticket { 
  id: number; 
  subject: string; 
  status: string; 
  createdAt: string;
  lastUpdatedAt: string;
  userId: number; // The ID of the user who created the ticket
  messages?: Message[]; // Messages associated with the ticket
  user?: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
  // Add other ticket fields as needed
}

const AdminTicketsPage: FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]); 
  const [loading, setLoading] = useState(true);
  const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null);
  const [selectedTicketDetails, setSelectedTicketDetails] = useState<Ticket | null>(null);
  const [messageContent, setMessageContent] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isClosing, setIsClosing] = useState(false); // State for closing ticket
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  // New state for user unread counts
  const [userUnreadCounts, setUserUnreadCounts] = useState<UserUnreadCountDto[]>([]);
  const [loadingUnreadCounts, setLoadingUnreadCounts] = useState(true);

  const navigate = useNavigate(); // Initialize navigate hook

  useEffect(() => {
    // Get current user ID from JWT token
    const token = getToken();
    if (token) {
      const data = decryptToJwt(token.toString());
      setCurrentUserId(data.userId);
    }
  }, []);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const allTickets = await getAllTickets();
      // Fetch details for each ticket to get message information for filtering
      const ticketsWithDetails = await Promise.all(allTickets.map((ticket: Ticket) => getTicketDetails(ticket.id)));
      setTickets(ticketsWithDetails);

    } catch (error) {
      console.error('Failed to fetch tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTicketDetails = async (id: number) => {
    try {
      setLoading(true);
      const details = await getTicketDetails(id);
      setSelectedTicketDetails(details);
      setSelectedTicketId(id);
    } catch (error) {
      console.error(`Failed to fetch ticket details for ID ${id}:`, error);
      setSelectedTicketDetails(null);
      setSelectedTicketId(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!selectedTicketId || !messageContent.trim() || isSending) return;

    setIsSending(true);
    const messageDto: SendAdminMessageDto = {
        content: messageContent,
    };

    try {
      await sendAdminMessage(selectedTicketId, messageDto);
      setMessageContent('');
      // Refresh ticket details to show the new message
      await fetchTicketDetails(selectedTicketId);

      // Show success alert
      Swal.fire({
        icon: 'success',
        title: 'پیام ارسال شد!',
        text: 'پیام شما با موفقیت ارسال شد.',
        confirmButtonText: 'باشه'
      });

    } catch (error) {
      console.error('Failed to send message:', error);
      // Show error alert
      Swal.fire({
        icon: 'error',
        title: 'خطا در ارسال پیام',
        text: 'هنگام ارسال پیام خطایی رخ داد. لطفا دوباره تلاش کنید.',
        confirmButtonText: 'باشه'
      });
    } finally {
      setIsSending(false);
    }
  };

  // Function to handle file download
  const handleDownloadFile = async (fileAttachmentId: number, filename: string) => {
    try {
      const blob = await downloadFileAttachment(fileAttachmentId);
      
      // Get the file extension from the blob type
      let fileExtension = '';
      if (blob.type === 'application/octet-stream') {
        // For octet-stream, we'll try to determine the type from the first few bytes
        const arrayBuffer = await blob.slice(0, 4).arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        
        // Check file signatures (magic numbers)
        if (uint8Array[0] === 0x25 && uint8Array[1] === 0x50 && uint8Array[2] === 0x44 && uint8Array[3] === 0x46) {
          fileExtension = 'pdf';
        } else if (uint8Array[0] === 0xFF && uint8Array[1] === 0xD8 && uint8Array[2] === 0xFF) {
          fileExtension = 'jpg';
        } else if (uint8Array[0] === 0x89 && uint8Array[1] === 0x50 && uint8Array[2] === 0x4E && uint8Array[3] === 0x47) {
          fileExtension = 'png';
        } else if (uint8Array[0] === 0x50 && uint8Array[1] === 0x4B && uint8Array[2] === 0x03 && uint8Array[3] === 0x04) {
          fileExtension = 'docx';
        } else {
          // If we can't determine the type, don't add an extension
          fileExtension = '';
        }
      } else {
        fileExtension = blob.type.split('/')[1] || '';
      }
      
      const extension = fileExtension ? `.${fileExtension}` : '';
      
      // Create a temporary link to trigger the download
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `فایل_پیوست_${fileAttachmentId}${extension}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      // Show success alert
      Swal.fire({
        icon: 'success',
        title: 'دانلود آغاز شد!',
        text: `دانلود فایل ${filename}${extension} به زودی آغاز می‌شود.`,
        confirmButtonText: 'باشه'
      });

    } catch (error) {
      console.error('Failed to download file:', error);
      // Show error alert
      Swal.fire({
        icon: 'error',
        title: 'خطا در دانلود',
        text: 'هنگام دانلود فایل خطایی رخ داد. لطفا دوباره تلاش کنید.',
        confirmButtonText: 'باشه'
      });
    }
  };

  // Function to determine if a ticket is unanswered by admin
  const isUnansweredByAdmin = (ticket: Ticket): boolean => {
    if (!ticket.messages || ticket.messages.length === 0) {
      return true; // No messages means unanswered
    }
    const lastMessage = ticket.messages[ticket.messages.length - 1];
    
    // Check if the last message was from a user (not admin) and not read by admin
    const isLastMessageFromUser = lastMessage.senderId.toString() !== currentUserId?.toString();
    return isLastMessageFromUser && !lastMessage.isReadByAdmin;
  };

  const unansweredTickets = tickets.filter(isUnansweredByAdmin);

  // Calculate opened tickets
  const openedTickets = tickets.filter(ticket => ticket.status !== 'Closed');

  // Function to handle closing a ticket
  const handleCloseTicket = async () => {
    if (!selectedTicketId || !selectedTicketDetails || isClosing) return; // Prevent closing while already closing
    // Add confirmation prompt if desired

    setIsClosing(true); // Set closing state

    try {
      await closeTicket(selectedTicketId); // Call the closeTicket service function
      // Refresh the list of tickets to reflect the status change
      await fetchTickets();
      // Deselect the ticket after closing
      setSelectedTicketId(null);
      setSelectedTicketDetails(null);

      // Show success alert
      Swal.fire({
        icon: 'success',
        title: 'تیکت بسته شد!', // Translated
        text: `تیکت #${selectedTicketId} با موفقیت بسته شد.`, // Translated
        confirmButtonText: 'باشه' // Translated
      });

    } catch (error) {
      console.error(`Failed to close ticket ID ${selectedTicketId}:`, error);
      // Show error alert
      Swal.fire({
        icon: 'error',
        title: 'خطا در بستن تیکت', // Translated
        text: 'هنگام بستن تیکت خطایی رخ داد. لطفا دوباره تلاش کنید.', // Translated
        confirmButtonText: 'باشه' // Translated
      });
    } finally {
      setIsClosing(false); // Reset closing state
    }
  };

  // Effect to fetch all tickets with details on component mount
  useEffect(() => {
    fetchTickets();
  }, []);

  // Effect to fetch user unread counts on component mount
  useEffect(() => {
    const fetchUnreadCounts = async () => {
      try {
        setLoadingUnreadCounts(true);
        const counts = await getUserUnreadCounts();
        setUserUnreadCounts(counts);
      } catch (error) {
        console.error('Failed to fetch user unread counts:', error);
      } finally {
        setLoadingUnreadCounts(false);
      }
    };
    fetchUnreadCounts();
  }, []); // Empty dependency array means this runs once on mount

  // Effect to fetch details when a ticket is selected
  useEffect(() => {
    if (selectedTicketId !== null) {
      fetchTicketDetails(selectedTicketId);
    }
  }, [selectedTicketId]);

  const usersWithUnread = userUnreadCounts.filter(userCount => userCount.unreadCount > 0);

  const userHasAccess = (permission: number) => {
    try {
      const token = getToken();
      if (!token) return false;
      const data = decryptToJwt(token.toString());
      return data?.Permissions?.includes(permission) || false;
    } catch {
      return false;
    }
  };

  return (
    <div className="d-flex flex-column flex-lg-row" dir="rtl" style={{ fontFamily: "sans" }}>
      {/* Ticket List */}
      <div className="flex-column flex-lg-row-auto w-100 w-lg-400px w-xl-500px mb-10 mb-lg-0">
        <div className="card card-flush">
          <div className="card-header pt-7">
            <h3 className="card-title">تیکت‌ها</h3> {/* Changed title to be more general */}
          </div>
          <div className="card-body pt-5" style={{ overflowY: 'auto', maxHeight: '600px' }}>
            {/* Display Users with Unread Counts */}
            <h4>کاربران با پیام بدون پاسخ ({usersWithUnread.length})</h4> {/* Translated title */}
            <div className="mb-5">
              {loadingUnreadCounts ? (
                <p>در حال بارگذاری کاربران با پیام بدون پاسخ...</p> 
              ) : usersWithUnread.length === 0 ? (
                <p>کاربری با پیام بدون پاسخ یافت نشد.</p> 
              ) : (
                <ul className="list-group">
                  {usersWithUnread.map(userCount => (
                    <li 
                      key={userCount.user.id} 
                      className={`list-group-item list-group-item-action`}
                      // TODO: Add functionality to filter tickets by user when clicking here
                      style={{ cursor: 'pointer' }}
                    >
                      <strong>کاربر: {userCount.user.firstName} {userCount.user.lastName || userCount.user.email}</strong> {/* Display user name or email */}
                      <br/>پیام بدون پاسخ: {userCount.unreadCount} {/* Display unread count */}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Display Opened Tickets (using the openedTickets state) */}
            <h4>تیکت‌های باز ({openedTickets.length})</h4> {/* Opened tickets count */}
             {loading ? (
                <p>در حال بارگذاری تیکت‌های باز...</p> 
              ) : openedTickets.length === 0 ? (
                <p>تیکت بازی یافت نشد.</p> 
              ) : (
            <ul className="list-group mb-5">
              {openedTickets.map((ticket: Ticket) => (
                <li 
                  key={ticket.id} 
                  className={`list-group-item list-group-item-action ${selectedTicketId === ticket.id ? 'active' : ''}`}
                  onClick={() => fetchTicketDetails(ticket.id)}
                  style={{ cursor: 'pointer' }}
                >
                  <strong>تیکت #{ticket.id}: {ticket.subject}</strong>
                  <br/>وضعیت: {ticket.status}
                  <br/>تاریخ ایجاد: {new Date(ticket.createdAt).toLocaleString('fa-IR')}
                </li>
              ))}
            </ul>
              )}

            {/* Display All Tickets (using the existing tickets state) */}
            <h4>همه تیکت‌ها ({tickets.length})</h4>
             {loading ? (
                <p>در حال بارگذاری همه تیکت‌ها...</p> 
              ) : tickets.length === 0 ? (
                <p>تیکتی یافت نشد.</p> 
              ) : (
            <ul className="list-group">
              {tickets
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .slice(0, 5)
                .map((ticket: Ticket) => (
                <li 
                  key={ticket.id} 
                  className={`list-group-item list-group-item-action ${selectedTicketId === ticket.id ? 'active' : ''}`}
                  onClick={() => fetchTicketDetails(ticket.id)}
                  style={{ cursor: 'pointer' }}
                >
                  <strong>تیکت #{ticket.id}: {ticket.subject}</strong>
                  <br/>وضعیت: {ticket.status}
                  <br/>کاربر: {ticket.user ? `${ticket.user.firstName} ${ticket.user.lastName}` : 'نامشخص'}
                  <br/>تاریخ ایجاد: {new Date(ticket.createdAt).toLocaleString('fa-IR')}
                </li>
              ))}
            </ul>
              )}
          </div>
        </div>
      </div>

      {/* Ticket Details / Chat Area */}
      <div className="flex-lg-row-fluid me-lg-7 me-xl-10">
        <div className="card" id="kt_chat_messenger">
          <div className="card-header" id="kt_chat_messenger_header">
            <div className="card-title">
              {selectedTicketDetails ? (
                <div className="d-flex justify-content-center flex-column me-3">
                  <span className="fs-4 fw-bolder text-gray-900 text-hover-primary me-1 mb-2 lh-1">
                    تیکت #{selectedTicketDetails.id}: {selectedTicketDetails.subject}
                  </span>
                  <div className="mb-0 lh-1">
                    <span className="badge badge-light">وضعیت: {selectedTicketDetails.status}</span>
                  </div>
                </div>
              ) : (
                <div className="fs-4 fw-bolder text-gray-900 me-1 mb-2 lh-1">
                  برای مشاهده جزئیات یک تیکت را انتخاب کنید
                </div>
              )}
            </div>
            <div className="card-toolbar">
              {/* Button to navigate to Ticket Groups page */}
              <button
                className="btn btn-sm btn-secondary me-2"
                onClick={() => navigate('/ticket-groups')}
              >
                مدیریت گروه‌های تیکت
              </button>
              {userHasAccess(PermissionEnums.CloseTicketButton) && (
                <button
                  className="btn btn-sm btn-danger"
                  onClick={handleCloseTicket}
                  disabled={isClosing}
                >
                  {isClosing ? 'در حال بستن...' : 'بستن تیکت'}
                </button>
              )}
              {/* Add other admin ticket actions here (e.g., assign) */}
            </div>
          </div>
          
          <div className="card-body" id="kt_chat_messenger_body" style={{ overflowY: 'auto', maxHeight: '500px' }}>
            {selectedTicketDetails ? (
              <div>
                {/* Display Messages */}
                {selectedTicketDetails.messages && selectedTicketDetails.messages.map(message => (
                  <div key={message.id} className={`d-flex justify-content-${message.senderId.toString() === currentUserId?.toString() ? 'end' : 'start'} mb-5`}>
                    <div className={`d-flex flex-column align-items-${message.senderId.toString() === currentUserId?.toString() ? 'end' : 'start'}`}>
                      <div className="d-flex align-items-center mb-2">
                        {message.senderId.toString() !== currentUserId?.toString() && ( // Only show sender name for non-admin messages
                          <div className="me-3">
                            <span className="fs-7 fw-bold text-gray-600">
                              {message.sender ? `${message.sender.firstName} ${message.sender.lastName}` : 'کاربر'}
                            </span>
                          </div>
                        )}
                        <span className="text-muted fs-7 mb-1">{new Date(message.createdAt).toLocaleString('fa-IR')}</span>
                      </div>
                      <div className={`p-5 rounded text-dark fw-bold mw-lg-400px ${message.senderId.toString() === currentUserId?.toString() ? 'bg-light-primary text-end' : 'bg-light-info text-start'}`} data-kt-element="message-text">
                        {message.content}
                        {/* Handle file attachments if applicable */}
                         {message.fileAttachmentId && (
                           <div className="mt-2">
                             {userHasAccess(PermissionEnums.DownloadAttachmentButton) && (
                               <button
                                 className="btn btn-link btn-sm"
                                 onClick={() => handleDownloadFile(message.fileAttachmentId!, `فایل_پیوست_${message.fileAttachmentId}`)}
                               >
                                 دانلود فایل (شناسه: {message.fileAttachmentId})
                               </button>
                             )}
                           </div>
                         )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="d-flex justify-content-center align-items-center h-100">
                <p>تیکتی انتخاب نشده است.</p> {/* Translated text */}
              </div>
            )}
          </div>

          {/* Message Input */}
          {selectedTicketDetails && ( // Only show input if a ticket is selected
            <div className="card-footer pt-4" id="kt_chat_messenger_footer">
              <textarea
                className="form-control form-control-flush mb-3"
                rows={1}
                data-kt-element="input"
                placeholder="پیامی بنویسید..." // Translated placeholder
                value={messageContent}
                onChange={(e) => setMessageContent(e.target.value)}
              ></textarea>
              <div className="d-flex flex-stack">
                <div className="d-flex align-items-center me-2">
                  {/* Add file upload or other options here */}
                </div>
                {userHasAccess(PermissionEnums.SendAdminMessageButton) && (
                  <button
                    className="btn btn-primary"
                    type="button"
                    data-kt-element="send"
                    onClick={handleSendMessage}
                    disabled={!messageContent.trim() || isSending}
                  >
                    {isSending ? 'در حال ارسال...' : 'ارسال'}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminTicketsPage; 