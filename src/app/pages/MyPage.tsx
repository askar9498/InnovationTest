// import React, { useMemo, useState } from "react";
// import { AgGridReact } from 'ag-grid-react';
// import { ModuleRegistry } from 'ag-grid-community';
// import { ClientSideRowModelModule } from 'ag-grid-community';

// ModuleRegistry.registerModules([ClientSideRowModelModule]);

// export function MyPage() {
//     const [rowData] = useState([
//         { id: 1, title: 'First Blog', author: 'John Doe', date: '2025-03-21' },
//         { id: 2, title: 'Second Blog', author: 'Jane Smith', date: '2025-03-20' },
//         { id: 3, title: 'Third Blog', author: 'Michael Johnson', date: '2025-03-19' },
//         { id: 4, title: 'Fourth Blog', author: 'Emily Davis', date: '2025-03-18' },
//         { id: 10, title: 'First Blog', author: 'John Doe', date: '2025-03-21' },
//         { id: 20, title: 'Second Blog', author: 'Jane Smith', date: '2025-03-20' },
//         { id: 30, title: 'Third Blog', author: 'Michael Johnson', date: '2025-03-19' },
//         { id: 40, title: 'Fourth Blog', author: 'Emily Davis', date: '2025-03-18' },
//         { id: 11, title: 'First Blog', author: 'John Doe', date: '2025-03-21' },
//         { id: 21, title: 'Second Blog', author: 'Jane Smith', date: '2025-03-20' },
//         { id: 31, title: 'Third Blog', author: 'Michael Johnson', date: '2025-03-19' },
//         { id: 41, title: 'Fourth Blog', author: 'Emily Davis', date: '2025-03-18' },
//     ]);

//     const [currentPage, setCurrentPage] = useState(1);
//     const pageSize = 5; // تعداد سطرهای هر صفحه

//     // محاسبه داده‌های صفحه‌ی جاری
//     const paginatedData = rowData.slice(
//         (currentPage - 1) * pageSize,
//         currentPage * pageSize
//     );

//     const totalPages = Math.ceil(rowData.length / pageSize);

//     const columnDefs = useMemo(
//         () => [
//             { headerName: 'Title', field: 'title', filter: true, sortable: true, flex: 1 },
//             { headerName: 'Author', field: 'author', filter: true, sortable: true, flex: 1 },
//             { headerName: 'Date', field: 'date', filter: true, sortable: true, flex: 1 },
//             {
//                 headerName: 'Actions',
//                 cellRenderer: (params: any) => (
//                     <div style={{ display: 'flex', gap: '8px' }}>
//                         <button onClick={() => handleEdit(params.data)} className="btn btn-sm btn-primary">
//                             Edit
//                         </button>
//                         <button onClick={() => handleDelete(params.data.id)} className="btn btn-sm btn-danger">
//                             Delete
//                         </button>
//                     </div>
//                 ),
//                 flex: 1,
//             },
//         ],
//         []
//     );

//     const handleEdit = (data: any) => {
//         alert(`Edit Blog: ${data.title}`);
//     };

//     const handleDelete = (id: number) => {
//         alert(`Delete Blog ID: ${id}`);
//     };

//     const handlePageChange = (newPage: number) => {
//         if (newPage >= 1 && newPage <= totalPages) {
//             setCurrentPage(newPage);
//         }
//     };

//     return (
//         <div className="container rtl">
//             <h3 className="w-auto text-center py-4">Manage Blogs</h3>

//             {/* === جدول === */}
//             <div className="ag-theme-alpine" style={{ height: 400, width: '100%' }}>
//                 <AgGridReact
//                     rowData={paginatedData}
//                     columnDefs={columnDefs}
//                     domLayout="autoHeight"
//                 />
//             </div>

//             {/* === پیجینیشن پایین === */}
//             <div className="d-flex justify-content-center mt-2">
//                 <button
//                     onClick={() => handlePageChange(currentPage - 1)}
//                     className="btn btn-outline-primary mx-1"
//                     disabled={currentPage === 1}
//                 >
//                     ◀️ Prev
//                 </button>
//                 {Array.from({ length: totalPages }, (_, i) => (
//                     <button
//                         key={i + 1}
//                         onClick={() => handlePageChange(i + 1)}
//                         className={`btn mx-1 ${currentPage === i + 1 ? 'btn-primary' : 'btn-outline-primary'}`}
//                     >
//                         {i + 1}
//                     </button>
//                 ))}
//                 <button
//                     onClick={() => handlePageChange(currentPage + 1)}
//                     className="btn btn-outline-primary mx-1"
//                     disabled={currentPage === totalPages}
//                 >
//                     Next ▶️
//                 </button>
//             </div>
//         </div>
//     );
// }
