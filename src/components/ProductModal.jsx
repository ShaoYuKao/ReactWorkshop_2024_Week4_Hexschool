import React from 'react';
import './ProductModal.css';

const ProductModal = ({
  tempProduct, // 暫存產品資料
  setTempProduct,  // 暫存產品資料設定函式
  handletempProductChange, // 處理產品資料變更事件
  handleImageChange, // 處理圖片變更事件
  handleAddImage, // 新增圖片欄位
  handleRemoveImage, // 刪除最後一個圖片欄位
  /**
   * 提交產品表單
   * 根據 tempProduct.id 判斷是新增還是編輯產品
   */
  handleSubmitProduct
}) => {
  return (
    <div
      id="productModal"
      className="modal fade"
      tabIndex="-1"
      aria-labelledby="productModalLabel"
      aria-hidden="true"
    >
      <div className="modal-dialog modal-xl">
        <div className="modal-content border-0">
          <div className="modal-header bg-dark text-white">
            <h5 id="productModalLabel" className="modal-title">
              <span>{tempProduct.id ? "編輯" : "新增"}產品</span>
            </h5>
            <button
              type="button"
              className="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
            ></button>
          </div>
          <div className="modal-body">
            <div className="row">
              <div className="col-sm-4">
                <div className="mb-2">
                  <div className="mb-3">
                    <label htmlFor="imageUrl" className="form-label">
                      輸入圖片網址
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="imageUrl"
                      value={tempProduct.imageUrl}
                      onChange={handletempProductChange}
                      placeholder="請輸入圖片連結"
                    />
                  </div>
                  <img className="img-fluid" src={tempProduct.imageUrl} alt="" />
                </div>
                {tempProduct.imagesUrl && tempProduct.imagesUrl.map((url, index) => (
                  <div className="mb-2" key={index}>
                    <input
                      type="text"
                      className="form-control"
                      value={url}
                      onChange={(e) => handleImageChange(index, e.target.value)}
                      placeholder="請輸入圖片連結"
                    />
                    {url && (<img className="img-fluid" src={url} alt="" />)}
                  </div>
                ))}
                <div>
                  <button className="btn btn-outline-primary btn-sm d-block w-100" onClick={handleAddImage}>
                    新增圖片
                  </button>
                </div>
                <div>
                  <button className="btn btn-outline-danger btn-sm d-block w-100" onClick={handleRemoveImage}>
                    刪除圖片
                  </button>
                </div>
              </div>
              <div className="col-sm-8">
                <div className="mb-3">
                  <label htmlFor="title" className="form-label">標題</label>
                  <input
                    id="title"
                    type="text"
                    className="form-control"
                    value={tempProduct.title}
                    onChange={handletempProductChange}
                    placeholder="請輸入標題"
                  />
                </div>

                <div className="row">
                  <div className="mb-3 col-md-6">
                    <label htmlFor="category" className="form-label">分類</label>
                    <input
                      id="category"
                      type="text"
                      className="form-control"
                      value={tempProduct.category}
                      onChange={handletempProductChange}
                      placeholder="請輸入分類"
                    />
                  </div>
                  <div className="mb-3 col-md-6">
                    <label htmlFor="unit" className="form-label">單位</label>
                    <input
                      id="unit"
                      type="text"
                      className="form-control"
                      value={tempProduct.unit}
                      onChange={handletempProductChange}
                      placeholder="請輸入單位"
                    />
                  </div>
                </div>

                <div className="row">
                  <div className="mb-3 col-md-6">
                    <label htmlFor="origin_price" className="form-label">原價</label>
                    <input
                      id="origin_price"
                      type="number"
                      min="0"
                      className="form-control"
                      value={tempProduct.origin_price}
                      onChange={handletempProductChange}
                      placeholder="請輸入原價"
                    />
                  </div>
                  <div className="mb-3 col-md-6">
                    <label htmlFor="price" className="form-label">售價</label>
                    <input
                      id="price"
                      type="number"
                      min="0"
                      className="form-control"
                      value={tempProduct.price}
                      onChange={handletempProductChange}
                      placeholder="請輸入售價"
                    />
                  </div>
                </div>
                <hr />

                <div className="mb-3">
                  <label htmlFor="description" className="form-label">產品描述</label>
                  <textarea
                    id="description"
                    className="form-control"
                    value={tempProduct.description}
                    onChange={handletempProductChange}
                    placeholder="請輸入產品描述"
                  ></textarea>
                </div>
                <div className="mb-3">
                  <label htmlFor="content" className="form-label">說明內容</label>
                  <textarea
                    id="content"
                    className="form-control"
                    value={tempProduct.content}
                    onChange={handletempProductChange}
                    placeholder="請輸入說明內容"
                  ></textarea>
                </div>
                <div className="mb-3">
                  <div className="form-check">
                    <input
                      id="is_enabled"
                      className="form-check-input d-flex me-2"
                      type="checkbox"
                      checked={tempProduct.is_enabled}
                      onChange={(e) => setTempProduct((prevData) => ({
                        ...prevData,
                        is_enabled: e.target.checked,
                      }))}
                    />
                    <label className="form-check-label" htmlFor="is_enabled">
                      是否啟用
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-outline-secondary"
              data-bs-dismiss="modal"
            >
              取消
            </button>
            <button type="button" className="btn btn-primary" onClick={handleSubmitProduct}>
              確認
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;
