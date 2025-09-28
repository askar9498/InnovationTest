import React, { FC, useEffect, useState, FormEvent } from 'react';
import { getMyTickets, createTicket, getTicketById, sendMessageWithFile, downloadFileAttachment, getTicketGroups, Ticket, Message, CreateTicketDto, TicketGroup, SendMessageWithFileDto, decryptToJwt, getToken } from '../../auth/core/_requests'; // Removed closeTicket, added decryptToJwt and getToken
import Swal from 'sweetalert2';

const UserTicketsPage: FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null);
  const [selectedTicketDetails, setSelectedTicketDetails] = useState<Ticket | null>(null);
  const [newMessageContent, setNewMessageContent] = useState('');
  const [newMessageFile, setNewMessageFile] = useState<File | null>(null);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [showCreateTicketForm, setShowCreateTicketForm] = useState(false);
  const [newTicketSubject, setNewTicketSubject] = useState('');
  const [newTicketGroupId, setNewTicketGroupId] = useState<number | ''>(''); // State for selected group ID
  const [ticketGroups, setTicketGroups] = useState<TicketGroup[]>([]); // State to store ticket groups
  const [loadingGroups, setLoadingGroups] = useState(true); // Loading state for groups
  const [isCreatingTicket, setIsCreatingTicket] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  useEffect(() => {
    // Get current user ID from JWT token
    const token = getToken();
    if (token) {
      const data = decryptToJwt(token.toString());
      setCurrentUserId(data.userId);
    }
  }, []);

  const fetchMyTickets = async () => {
    try {
      setLoading(true);
      const userTickets = await getMyTickets();
      setTickets(userTickets);
    } catch (error) {
      console.error('Failed to fetch user tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTicketDetails = async (id: number) => {
    try {
      setLoading(true);
      const details = await getTicketById(id);
      setSelectedTicketDetails(details);
      setSelectedTicketId(id);
      // Optionally, mark messages as read here if needed and there's a backend endpoint for it
    } catch (error) {
      console.error(`Failed to fetch ticket details for ID ${id}:`, error);
      setSelectedTicketDetails(null);
      setSelectedTicketId(null);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTicket = async (event: FormEvent) => {
    event.preventDefault();
    if (!newTicketSubject.trim() || newTicketGroupId === '' || isCreatingTicket) return;

    setIsCreatingTicket(true);
    const newTicket: CreateTicketDto = { title: newTicketSubject, groupId: Number(newTicketGroupId) };

    try {
      const createdTicket = await createTicket(newTicket);
      // به جای اضافه کردن دستی، لیست را مجدداً از سرور بگیر
      await fetchMyTickets();
      setSelectedTicketId(createdTicket.id);
      // setSelectedTicketDetails(createdTicket); // حذف شود، چون useEffect خودش جزئیات را می‌گیرد
      setNewTicketSubject('');
      setNewTicketGroupId(''); // Reset group selection
      setShowCreateTicketForm(false);
      // If the created ticket details don't include messages, fetch them
      if (!createdTicket.messages || createdTicket.messages.length === 0) {
         fetchTicketDetails(createdTicket.id); // Fetch details to get messages
      }

      // Show success alert
      Swal.fire({
        icon: 'success',
        title: 'تیکت ایجاد شد!',
        text: `تیکت #${createdTicket.id} با موفقیت ایجاد شد.`,
        confirmButtonText: 'باشه'
      });

    } catch (error) {
      console.error('Failed to create ticket:', error);
      // Show error alert
      Swal.fire({
        icon: 'error',
        title: 'خطا در ایجاد تیکت',
        text: 'هنگام ایجاد تیکت خطایی رخ داد. لطفا دوباره تلاش کنید.',
        confirmButtonText: 'باشه'
      });
    } finally {
      setIsCreatingTicket(false);
    }
  };

  const handleSendMessage = async (event: FormEvent) => {
    event.preventDefault();
    if (!selectedTicketId || (!newMessageContent.trim() && !newMessageFile) || isSendingMessage) return;

    setIsSendingMessage(true);
    const messageDto: SendMessageWithFileDto = { // Create the DTO object
        content: newMessageContent,
        file: newMessageFile || undefined,
    };

    try {
      await sendMessageWithFile(selectedTicketId, messageDto); // Pass the DTO
      setNewMessageContent('');
      setNewMessageFile(null);
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
      setIsSendingMessage(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setNewMessageFile(event.target.files[0]);
    } else {
      setNewMessageFile(null);
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

  useEffect(() => {
    fetchMyTickets();
  }, []);

  // Effect to fetch ticket groups on component mount
  useEffect(() => {
    const fetchTicketGroups = async () => {
      try {
        setLoadingGroups(true);
        const groups = await getTicketGroups();
        setTicketGroups(groups);
         // Optionally, set a default selected group if desired
        if (groups.length > 0) {
             setNewTicketGroupId(groups[0].id);
        }

      } catch (error) {
        console.error('Failed to fetch ticket groups:', error);
      } finally {
        setLoadingGroups(false);
      }
    };

    fetchTicketGroups();
  }, []); // Empty dependency array means this effect runs only once on mount

  // Effect to fetch details when a ticket is selected
  useEffect(() => {
    if (selectedTicketId !== null) {
      fetchTicketDetails(selectedTicketId);
    }
  }, [selectedTicketId]);

  return (
    <div className="d-flex flex-column flex-lg-row" dir="rtl" style={{ fontFamily: "sans" }}>
      {/* Ticket List */}
      <div className="flex-column flex-lg-row-auto w-100 w-lg-400px w-xl-500px mb-10 mb-lg-0">
        <div className="card card-flush">
          <div className="card-header pt-7">
            <h3 className="card-title">تیکت‌های من ({tickets.length})</h3>
            <div className="card-toolbar">
               <button
                className="btn btn-sm btn-primary"
                onClick={() => setShowCreateTicketForm(!showCreateTicketForm)}
              >
                {showCreateTicketForm ? 'لغو ایجاد تیکت' : 'ایجاد تیکت جدید'}
              </button>
            </div>
          </div>
          <div className="card-body pt-5" style={{ overflowY: 'auto', maxHeight: '600px' }}>
             {showCreateTicketForm && (
                <div className="mb-5">
                    <h4>ایجاد تیکت جدید</h4>
                    {loadingGroups ? (
                       <p>در حال بارگذاری گروه‌ها...</p>
                    ) : ticketGroups.length === 0 ? (
                       <p>گروه تیکتی در دسترس نیست.</p>
                    ) : (
                    <form onSubmit={handleCreateTicket}>
                         <div className="mb-3">
                            <label htmlFor="ticketGroup" className="form-label">گروه</label>
                            <select
                                className="form-select"
                                id="ticketGroup"
                                value={newTicketGroupId}
                                onChange={(e) => setNewTicketGroupId(Number(e.target.value))}
                                required
                            >
                                {ticketGroups.map(group => (
                                    <option key={group.id} value={group.id}>{group.name}</option>
                                ))}
                            </select>
                         </div>
                        <div className="mb-3">
                            <label htmlFor="ticketSubject" className="form-label">موضوع</label>
                            <input 
                                type="text" 
                                className="form-control"
                                id="ticketSubject" 
                                value={newTicketSubject} 
                                onChange={(e) => setNewTicketSubject(e.target.value)}
                                required
                            />
                        </div>
                        <button 
                            type="submit" 
                            className="btn btn-primary"
                            disabled={!newTicketSubject.trim() || newTicketGroupId === '' || isCreatingTicket}
                        >
                            {isCreatingTicket ? 'در حال ایجاد...' : 'ایجاد تیکت'}
                        </button>
                    </form>
                     )}
                </div>
            )}

            {loading ? (
                <p>در حال بارگذاری تیکت‌ها...</p>
              ) : tickets.length === 0 ? (
                <p>تیکتی یافت نشد.</p>
              ) : (
            <ul className="list-group">
              {tickets.map(ticket => (
                <li 
                  key={ticket.id} 
                  className={`list-group-item list-group-item-action ${selectedTicketId === ticket.id ? 'active' : ''}`}
                  onClick={() => setSelectedTicketId(ticket.id)}
                  style={{ cursor: 'pointer' }}
                >
                  <strong>تیکت #{ticket.id}: {ticket.subject}</strong>
                  <br/>وضعیت: {ticket.status}
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
                  برای مشاهده جزئیات یک تیکت را انتخاب کنید یا یک تیکت جدید ایجاد کنید
                </div>
              )}
            </div>
            <div className="card-toolbar"></div>
          </div>
          
          <div className="card-body" id="kt_chat_messenger_body" style={{ overflowY: 'auto', maxHeight: '500px' }}>
            {selectedTicketDetails ? (
              <div>
                {/* Display Messages */}
                {selectedTicketDetails.messages && selectedTicketDetails.messages.map(message => (
                  <div key={message.id} className={`d-flex justify-content-${message.senderId.toString() === currentUserId?.toString() ? 'start' : 'end'} mb-5`}>
                    <div className={`d-flex flex-column align-items-${message.senderId.toString() === currentUserId?.toString() ? 'start' : 'end'}`}>
                      <div className="d-flex align-items-center mb-2">
                        <div className="me-3">
                          <span className="fs-7 fw-bold text-gray-600">
                            {message.senderId.toString() === currentUserId?.toString() 
                              ? 'شما' 
                              : message.sender 
                                ? `${message.sender.firstName} ${message.sender.lastName}`
                                : 'پشتیبانی'}
                          </span>
                        </div>
                        <span className="text-muted fs-7 mb-1">{new Date(message.createdAt).toLocaleString('fa-IR')}</span>
                      </div>
                      <div className={`p-5 rounded text-dark fw-bold mw-lg-400px ${message.senderId.toString() === currentUserId?.toString() ? 'bg-light-info text-start' : 'bg-light-primary text-end'}`} data-kt-element="message-text">
                        {message.content}
                        {/* Handle file attachments if applicable */}
                         {message.fileAttachmentId && (
                           <div className="mt-2">
                             <button
                                className="btn btn-link btn-sm"
                                onClick={() => handleDownloadFile(message.fileAttachmentId!, `فایل_پیوست_${message.fileAttachmentId}`)}
                              >
                                دانلود فایل (شناسه: {message.fileAttachmentId})
                              </button>
                           </div>
                         )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="d-flex justify-content-center align-items-center h-100">
                <p>برای مشاهده پیام‌ها یک تیکت را انتخاب کنید.</p>
              </div>
            )}
          </div>

          {/* Message Input */}
          {selectedTicketDetails && selectedTicketDetails.status !== 'Closed' && ( // Only show input if a ticket is selected and not closed
            <form onSubmit={handleSendMessage} className="card-footer pt-4" id="kt_chat_messenger_footer">
              <textarea
                className="form-control form-control-flush mb-3"
                rows={1}
                data-kt-element="input"
                placeholder="پیامی بنویسید..."
                value={newMessageContent}
                onChange={(e) => setNewMessageContent(e.target.value)}
              ></textarea>
              <div className="d-flex flex-stack">
                <div className="d-flex align-items-center me-2">
                  {/* File Upload Input */}
                  <label htmlFor="messageFile" className="btn btn-icon btn-sm me-1 position-relative">
                     <i className="bi bi-paperclip fs-3"></i>
                     <input 
                        type="file" 
                        id="messageFile"
                        className="d-none" 
                        onChange={handleFileChange}
                     />
                     {newMessageFile && <span className="badge badge-light-primary badge-circle position-absolute top-0 start-100 translate-middle">1</span>}
                  </label>
                   {newMessageFile && <span className="text-muted fs-7">{newMessageFile.name}</span>}
                </div>
                <button
                  className="btn btn-primary"
                  type="submit"
                  data-kt-element="send"
                  disabled={(!newMessageContent.trim() && !newMessageFile) || isSendingMessage}
                >
                  {isSendingMessage ? 'در حال ارسال...' : 'ارسال'}
                </button>
              </div>
            </form>
          )}
           {selectedTicketDetails && selectedTicketDetails.status === 'Closed' && (
             <div className="card-footer pt-4 text-center">
                <span className="badge badge-warning">این تیکت بسته شده است.</span>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default UserTicketsPage; 