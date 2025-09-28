import { FC } from "react";

type Props = {
    className: string
}

function PagingForTables({ }) {
    return (<>

        <div className='d-flex flex-stack flex-wrap py-4 px-20 hidden' style={{ fontFamily: 'sans' }} dir="rtl">
            <div className="text-base font-bold text-gray-700 ">
                نمایش 1 تا 10 از 53 رکورد
            </div>

            <ul className='pagination'>
                <li className='page-item next'>
                    <a href='#' className='page-link'>
                        <i className=' next'></i>
                    </a>
                </li>

                <li className='page-item active'>
                    <a href='#' className='page-link'>
                        1
                    </a>
                </li>

                <li className='page-item'>
                    <a href='#' className='page-link'>
                        2
                    </a>
                </li>

                <li className='page-item'>
                    <a href='#' className='page-link'>
                        3
                    </a>
                </li>

                <li className='page-item'>
                    <a href='#' className='page-link'>
                        4
                    </a>
                </li>

                <li className='page-item'>
                    <a href='#' className='page-link'>
                        5
                    </a>
                </li>

                <li className='page-item'>
                    <a href='#' className='page-link'>
                        6
                    </a>
                </li>

                <li className='page-item previous'>
                    <a href='#' className='page-link'>
                        <i className='previous'></i>
                    </a>
                </li>
            </ul>
        </div>
    </>
    );
}

export { PagingForTables };