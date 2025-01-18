import React from 'react';

const Pagination = ({ 
  pagination, // 分頁資訊
  currentPage, // 目前頁數
  setCurrentPage, 
  currentGroup, // 目前群組索引
  setCurrentGroup, 
  pagesPerGroup // 每個群組包含的頁數
}) => {
  const totalGroups = Math.ceil(pagination.total_pages / pagesPerGroup);

  const handleNext = () => {
    if (currentGroup < totalGroups - 1) {
      setCurrentGroup(currentGroup + 1);
    }

    const newCurrentPage = currentPage + 1;
    if (newCurrentPage <= pagination.total_pages) {
      setCurrentPage(newCurrentPage);
    }
  };

  const handlePrevious = () => {
    if (currentGroup > 0) {
      setCurrentGroup(currentGroup - 1);
    }

    const newCurrentPage = currentPage - 1;
    if (newCurrentPage > 0) {
      setCurrentPage(newCurrentPage);
    }
  };

  return (
    pagination.total_pages > 1 && (
      <div className="d-flex justify-content-end">
        <nav aria-label="Page navigation">
          <ul className="pagination">
            <li className={"page-item " + (pagination.has_pre ? "" : "disabled")}>
              <a className="page-link" href="#" aria-label="Previous" onClick={handlePrevious}>
                <span aria-hidden="true">&laquo;</span>
              </a>
            </li>

            {[...Array(pagesPerGroup)].map((_, index) => {
              const pageNumber = currentGroup * pagesPerGroup + index + 1;
              if (pageNumber > pagination.total_pages) return null;
              return (
                <li
                  className={"page-item " + (currentPage === Number(pageNumber) ? "active" : "")}
                  key={pageNumber}
                  onClick={() => setCurrentPage(pageNumber)}
                >
                  <a className="page-link" href="#">{pageNumber}</a>
                </li>
              );
            })}

            <li className={"page-item " + (pagination.has_next ? "" : "disabled")}>
              <a className="page-link" href="#" aria-label="Next" onClick={handleNext} >
                <span aria-hidden="true">&raquo;</span>
              </a>
            </li>
          </ul>
        </nav>
      </div>
    )
  );
};

export default Pagination;
