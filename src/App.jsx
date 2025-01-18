import { useState, useEffect, useRef } from "react";
import * as bootstrap from "bootstrap";
import axios from "axios";
import Loading from "react-fullscreen-loading";
import './App.css';
import ProductModal from './components/ProductModal';
import Pagination from './components/Pagination'; // 新增這行

const API_BASE = "https://ec-course-api.hexschool.io/v2";
const API_PATH = "202501-react-shaoyu";
const initTempProduct = {
  id: "",
  imageUrl: "",
  imagesUrl: [],
  title: "",
  category: "",
  unit: "",
  origin_price: 0,
  price: 0,
  description: "",
  content: "",
  is_enabled: false,
};

function App() {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  }); // 登入表單資料
  const [isAuth, setIsAuth] = useState(false);  // 是否為管理員
  const [products, setProducts] = useState([]); // 產品列表
  const [isLoading, setIsLoading] = useState(false); // 是否載入中
  const [pagination, setPagination] = useState({
    "total_pages": 1,
    "has_pre": false,
    "has_next": false,
    "category": ""
  }); // 分頁資訊
  const [currentGroup, setCurrentGroup] = useState(0); // 目前群組索引
  const [currentPage, setCurrentPage] = useState(1); // 目前頁數
  const productModalRef = useRef(null); // 產品 Modal 的 ref

  const [tempProduct, setTempProduct] = useState({
    ...initTempProduct
  }); // 暫存產品資料

  useEffect(() => {
    if (getToken()) {
      checkAdmin();
    }
    productModalRef.current = new bootstrap.Modal('#productModal', {
      keyboard: false,
      backdrop: 'static'
    });
  }, []);

  useEffect(() => {
    if (isAuth) {
      fetchProducts();
    }
  }, [isAuth]);

  useEffect(() => {
    fetchProducts();
  }, [currentPage]);

  /**
   * 檢查使用者是否為管理員
   */
  const checkAdmin = async () => {
    const token = getToken();
    if (!token) return;

    setIsLoading(true);

    const url = `${API_BASE}/api/user/check`;
    axios.defaults.headers.common.Authorization = token;

    try {
      const res = await axios.post(url);
      const { success } = res.data;
      if (!success) {
        throw new Error("使用者驗證失敗");
      }
      setIsAuth(true);
    } catch (error) {
      console.error("使用者驗證失敗", error);
      clearToken();
      setIsAuth(false);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 處理輸入變更事件的函式
   * @param {Object} e 事件對象
   * @param {string} e.target.id - 觸發事件的元素的 ID
   * @param {string} e.target.value - 觸發事件的元素的值
   */
  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [id]: value,
    }));
  };

  /**
   * 使用者點擊[登入]按鈕，處理表單提交的異步函數
   * @param {Event} e 表單提交事件
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await axios.post(`${API_BASE}/admin/signin`, formData);
      const { token, expired } = response.data;

      // 寫入 cookie token
      // expires 設置有效時間
      document.cookie = `hexToken=${token};expires=${new Date(expired)};`;

      axios.defaults.headers.common.Authorization = token;
      setIsAuth(true);
    } catch (error) {
      alert("登入失敗: " + error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 從伺服器獲取產品資料並更新狀態。
   * @async
   * @function fetchProducts
   * @returns {Promise<void>} 無返回值。
   * @throws 取得產品資料失敗時拋出錯誤。
   */
  const fetchProducts = async () => {
    if (!isAuth) return;

    setIsLoading(true);

    try {
      const response = await axios.get(
        `${API_BASE}/api/${API_PATH}/admin/products?page=${currentPage}`
      );
      const { total_pages, has_pre, has_next, category } = response.data.pagination;
      setPagination({
        ...pagination,
        total_pages: total_pages,
        has_pre: has_pre,
        has_next: has_next,
        category: category
      });
      setProducts(response.data.products);
    } catch (error) {
      console.error("取得產品資料失敗", error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 執行登出操作的非同步函式。
   * 
   * 此函式會向伺服器發送登出請求，並根據伺服器回應的結果進行處理。
   * 如果登出成功，會清除瀏覽器中的 cookie 並更新認證狀態。
   * 如果登出失敗，會在控制台顯示錯誤訊息。
   * 
   * @async
   * @function logout
   * @throws {Error} 如果伺服器回應登出失敗，會拋出錯誤。
   */
  const logout = async () => {
    setIsLoading(true);
    const url = `${API_BASE}/logout`;

    try {
      const res = await axios.post(url);
      const { success, message } = res.data;
      if (!success) {
        throw new Error(message);
      }
    } catch (error) {
      console.error("登出失敗", error);
    } finally {
      axios.defaults.headers.common["Authorization"] = undefined;
      clearToken();
      setIsAuth(false);
      setFormData({
        username: "",
        password: "",
      });
      setIsLoading(false);
    }
  };

  /**
   * 取得 Cookie 中的 hexToken
   * @returns {string|null} 返回 Token 字串，如果不存在則返回 null
   */
  const getToken = () => {
    // 取出 Token
    const token = document.cookie.replace(
      /(?:(?:^|.*;\s*)hexToken\s*=\s*([^;]*).*$)|^.*$/,
      "$1"
    );
    return token || null;
  };

  /**
   * 清除 Token
   * 此函式會將名為 "hexToken" 的 cookie 設定為過期，從而達到清除 Token 的效果。
   */
  const clearToken = () => {
    // 清除 Token
    document.cookie = "hexToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  };

  // === 頁數群組 start ===
  // 每個群組包含的頁數，預設設定為 5
  const pagesPerGroup = 5;

  // 計算總共有多少個群組數
  const totalGroups = Math.ceil(pagination.total_pages / pagesPerGroup);

  /**
   * 處理下一個群組的邏輯。
   * 如果目前的群組索引小於總群組數減一，則將目前的群組索引加一。
   */
  const handleNext = () => {
    if (currentGroup < totalGroups - 1) {
      setCurrentGroup(currentGroup + 1);
    }

    const newCurrentPage = currentPage + 1;
    if (newCurrentPage <= pagination.total_pages) {
      setCurrentPage(newCurrentPage);
    }
  };

  /**
   * 處理上一組的邏輯。
   * 如果 currentGroup 大於 0，則將 currentGroup 減 1。
   */
  const handlePrevious = () => {
    if (currentGroup > 0) {
      setCurrentGroup(currentGroup - 1);
    }

    const newCurrentPage = currentPage - 1;
    if (newCurrentPage > 0) {
      setCurrentPage(newCurrentPage);
    }
  };

  // === 頁數群組 end ===

  /**
   * 開啟產品 Modal
   */
  const openProductModal = () => {
    productModalRef.current.show();
  }

  /**
   * 關閉產品 Modal
   */
  const closeProductModal = () => {
    productModalRef.current.hide();
  }

  /**
   * 開啟新增產品 Modal
   */
  const handleCreateProduct = () => {
    clearTempProduct();
    openProductModal();
  };

  /**
   * 處理產品資料變更事件
   * @param {Object} e 事件對象
   * @param {string} e.target.id - 觸發事件的元素的 ID
   * @param {string} e.target.value - 觸發事件的元素的值
   */
  const handletempProductChange = (e) => {
    const { id, value } = e.target;
    setTempProduct((prevData) => ({
      ...prevData,
      [id]: value,
    }));
  };

  /**
   * 新增圖片欄位
   */
  const handleAddImage = () => {
    setTempProduct((prevData) => {
      if (prevData.imagesUrl.length >= 5) {
        return prevData;
      }
      return {
        ...prevData,
        imagesUrl: [...prevData.imagesUrl, ""],
      };
    });
  };

  /**
   * 刪除最後一個圖片欄位
   */
  const handleRemoveImage = () => {
    setTempProduct((prevData) => ({
      ...prevData,
      imagesUrl: prevData.imagesUrl.slice(0, -1),
    }));
  };

  /**
   * 處理圖片變更事件
   * @param {number} index - 圖片索引
   * @param {string} value - 圖片網址
   */
  const handleImageChange = (index, value) => {
    const newImagesUrl = [...tempProduct.imagesUrl];
    newImagesUrl[index] = value;
    setTempProduct((prevData) => ({
      ...prevData,
      imagesUrl: newImagesUrl,
    }));
  };

  /**
   * 檢查必填欄位是否有值
   * @returns {boolean} 如果所有必填欄位都有值，返回 true，否則返回 false。
   */
  const checkRequired = () => {
    if (!tempProduct.imageUrl || !tempProduct.title || !tempProduct.category || !tempProduct.unit || !tempProduct.origin_price || !tempProduct.price) {
      if (!tempProduct.imageUrl) {
        alert("請輸入圖片網址");
        return false;
      };
      if (!tempProduct.title) {
        alert("請輸入標題");
        return false;
      }
      if (!tempProduct.category) {
        alert("請輸入分類");
        return false;
      }
      if (!tempProduct.unit) {
        alert("請輸入單位");
        return false;
      }
      if (!tempProduct.origin_price) {
        alert("請輸入原價");
        return false;
      }
      if (!tempProduct.price) {
        alert("請輸入售價");
        return false;
      }
    }
    return true;
  }

  /**
   * 檢查價格是否為正數
   * @param {number} number - 要檢查的數字
   * @returns {boolean} 如果數字是正數，返回 true，否則返回 false
   */
  const checkPrice = (number) => {
    const num = Number(number);
    if (isNaN(num) || num < 0) {
      return false;
    }
    return true;
  }

  /**
   * 清除暫存產品資料
   */
  const clearTempProduct = () => {
    setTempProduct({
      ...initTempProduct
    });
  }

  /**
   * 處理編輯產品的邏輯
   * @param {Object} product - 要編輯的產品對象
   */
  const handleEditProduct = (product) => {
    setTempProduct(product);
    openProductModal();
  };

  /**
   * 提交產品表單
   * 根據 tempProduct.id 判斷是新增還是編輯產品
   * @returns {Promise<void>} 無返回值
   */
  const handleSubmitProduct = async () => {
    if (false === checkRequired()) {
      return;
    }

    if (false === checkPrice(tempProduct.origin_price)) {
      alert("原價請輸入大於 0 的數字");
      return;
    }

    if (false === checkPrice(tempProduct.price)) {
      alert("售價請輸入大於 0 的數字");
      return;
    }

    setIsLoading(true);
    closeProductModal();

    let imagesUrl = [];
    if (tempProduct.imagesUrl) {
      // 清除 tempProduct.imagesUrl 裡的空字串
      imagesUrl = tempProduct.imagesUrl.filter((url) => url.trim() !== "");
    }

    const reqPayload = {
      ...tempProduct,
      imagesUrl,
      origin_price: Number(tempProduct.origin_price),
      price: Number(tempProduct.price),
    };

    try {
      const response = tempProduct.id
        ? await axios.put(`${API_BASE}/api/${API_PATH}/admin/product/${tempProduct.id}`, { data: reqPayload })
        : await axios.post(`${API_BASE}/api/${API_PATH}/admin/product`, { data: reqPayload });

      if (!response.data.success) {
        throw new Error(response.data.message);
      }
      alert(tempProduct.id ? "編輯商品成功" : "新增商品成功");
      clearTempProduct();
      fetchProducts();
    } catch (error) {
      alert((tempProduct.id ? "編輯" : "新增") + "商品失敗: " + error);
      openProductModal();
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 刪除商品
   * @param {string} productId - 要刪除的商品 ID
   */
  const handleDeleteProduct = async (productId) => {
    if (!window.confirm("確定要刪除此商品嗎？")) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.delete(`${API_BASE}/api/${API_PATH}/admin/product/${productId}`);
      if (!response.data.success) {
        throw new Error(response.data.message);
      }
      alert("刪除商品成功");
      fetchProducts();
    } catch (error) {
      alert("刪除商品失敗: " + error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Loading loading={isLoading} background="rgba(46, 204, 113, 0.5)" loaderColor="#3498db" />
      {isAuth ? (
        <>
          <div className="container mt-3">
            <button
              type="button"
              className="btn btn-outline-secondary d-block ms-auto"
              onClick={logout}
            >登出</button>
          </div>

          <div className="container">
            <div className="text-end mt-4">
              <button className="btn btn-primary" onClick={handleCreateProduct}>
                建立新的產品
              </button>
            </div>
            <table className="table mt-4">
              <thead>
                <tr>
                  <th width="120">分類</th>
                  <th>產品名稱</th>
                  <th width="120">原價</th>
                  <th width="120">售價</th>
                  <th width="100">是否啟用</th>
                  <th width="120">編輯</th>
                </tr>
              </thead>
              <tbody>
                {products && products.length > 0 ? (
                  products.map((item) => (
                    <tr key={item.id}>
                      <td>{item.category}</td>
                      <td>{item.title}</td>
                      <td className="text-end">{item.origin_price}</td>
                      <td className="text-end">{item.price}</td>
                      <td>
                        {item.is_enabled ? (<span className="text-success">啟用</span>) : (<span>未啟用</span>)}
                      </td>
                      <td>
                        <div className="btn-group">
                          <button type="button" className="btn btn-outline-primary btn-sm" onClick={() => handleEditProduct(item)}>
                            編輯
                          </button>
                          <button type="button" className="btn btn-outline-danger btn-sm" onClick={() => handleDeleteProduct(item.id)}>
                            刪除
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5">尚無產品資料</td>
                  </tr>
                )}

              </tbody>
            </table>
            {/* 使用 Pagination 元件 */}
            <Pagination
              pagination={pagination}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              currentGroup={currentGroup}
              setCurrentGroup={setCurrentGroup}
              pagesPerGroup={pagesPerGroup}
            />
          </div>
        </>
      ) : (
        <div className="container login">
          <div className="row justify-content-center">
            <h1 className="h3 mb-3 font-weight-normal">請先登入</h1>
            <div className="col-8">
              <form id="form" className="form-signin" onSubmit={handleSubmit}>
                <div className="form-floating mb-3">
                  <input
                    type="email"
                    className="form-control"
                    id="username"
                    placeholder="name@example.com"
                    value={formData.username}
                    onChange={handleInputChange}
                    required
                    autoFocus
                  />
                  <label htmlFor="username">Email address</label>
                </div>
                <div className="form-floating">
                  <input
                    type="password"
                    className="form-control"
                    id="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                  />
                  <label htmlFor="password">Password</label>
                </div>
                <button
                  className="btn btn-lg btn-primary w-100 mt-3"
                  type="submit"
                >
                  登入
                </button>
              </form>
            </div>
          </div>
          <p className="mt-5 mb-3 text-muted">&copy; 2024~∞ - 六角學院</p>
        </div>
      )}
      <ProductModal
        tempProduct={tempProduct}
        handletempProductChange={handletempProductChange}
        handleImageChange={handleImageChange}
        handleAddImage={handleAddImage}
        handleRemoveImage={handleRemoveImage}
        handleSubmitProduct={handleSubmitProduct}
        setTempProduct={setTempProduct}
      />
    </>
  );
}

export default App;
