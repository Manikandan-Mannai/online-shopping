import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { addToCart } from "../slices/cartSlice";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";



const Home = () => {
  const { items: data, status } = useSelector((state) => state.products);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const maxDescriptionWords = 10;

  console.log("Home.jsx - data", data);

  const [brandOptions, setBrandOptions] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState("");
  const [loadingBrandOptions, setLoadingBrandOptions] = useState(true);

  const truncateDescription = (description) => {
    const words = description.split(" ");
    return words.length > maxDescriptionWords
      ? words.slice(0, maxDescriptionWords).join(" ") + " ..."
      : description;
  };

  useEffect(() => {
    const fetchBrandOptions = async () => {
      // Simulate fetching brand options from an API or any other source
      try {
        // Assuming brands are available in the 'brands' array
        const brands = [...new Set(data.map((product) => product.brand))];
        // Filter out empty strings
        const filteredBrands = brands.filter((brand) => brand.trim() !== "");

        setBrandOptions(filteredBrands);
      } catch (error) {
        console.error("Error fetching brand options:", error);
      } finally {
        setLoadingBrandOptions(false);
      }
    };

    fetchBrandOptions();
  }, [data]);

  let filteredData = [];
  if (status === "success" && data && data.length > 0) {
    filteredData = data.filter(
      (product) => !selectedBrand || product.brand === selectedBrand
    );
  }

  const handleAddToCart = (product) => {
    dispatch(addToCart(product));
    navigate("/cart");
  };

  const handleBrandChange = (event) => {
    setSelectedBrand(event.target.value);
  };

  useEffect(() => {
    setSelectedBrand("");
  }, []);

  return (
    <div className="home-container">
      {status === "success" ? (
        <>
          <h2>New Arrivals</h2>
          {loadingBrandOptions ? (
            <p>Loading brands...</p>
          ) : (
            <select value={selectedBrand} onChange={handleBrandChange}>
              <option value="">All Brands</option>
              {brandOptions.map((brand) => (
                <option key={brand} value={brand}>
                  {brand}
                </option>
              ))}
            </select>
          )}
          <div className="products">
            {filteredData.map((product) => (
              <div key={product._id} className="product">
                <h3>{product.name}</h3>
                <Link to={`/product/${product._id}`}>
                  <img src={product.images[0].url} alt={product.name} />
                </Link>
                <div className="details">
                  <span className="price">₹{product.price}</span>
                  <span>{truncateDescription(product.desc)}</span>
                </div>
                <button onClick={() => handleAddToCart(product)}>
                  Add To Cart
                </button>
              </div>
            ))}

          </div>
        </>
      ) : status === "pending" ? (
        <p>Loading...</p>
      ) : (
        <p>Unexpected error occurred...</p>
      )}
    </div>
  );
};

export default Home;



// import { useDispatch, useSelector } from "react-redux";
// import { useNavigate } from "react-router";
// import { addToCart } from "../slices/cartSlice";
// import { Link } from "react-router-dom";

// const Home = () => {
//   const { items: data, status } = useSelector((state) => state.products);
//   const dispatch = useDispatch();
//   const navigate = useNavigate();
//   const maxDescriptionWords = 10;

//   const truncateDescription = (description) => {
//     const words = description.split(" ");
//     if (words.length > maxDescriptionWords) {
//       return words.slice(0, maxDescriptionWords).join(" ") + " ...";
//     }
//     return description;
//   };

//   const handleAddToCart = (product) => {
//     dispatch(addToCart(product));
//     navigate("/cart");
//   };

//   return (
//     <div className="home-container">
//       {status === "success" ? (
//         <>
//           <h2>New Arrivals</h2>
//           <div className="products">
//             {data &&
//               data?.map((product) => (
//                 <div key={product._id} className="product">
//                   <h3>{product.name}</h3>
//                   <Link to={`product/${product._id}`}>
//                     {/* Display the first image of the product */}
//                     <img src={product.images[0]?.url || product.image.url} alt={product.name} />
//                   </Link>
//                   <div className="details">
//                     <span className="price">${product.price}</span>
//                     <span>{truncateDescription(product.desc)}</span>
//                   </div>
//                   <button onClick={() => handleAddToCart(product)}>Add To Cart</button>
//                 </div>
//               ))}
//           </div>
//         </>
//       ) : status === "pending" ? (
//         <p>Loading...</p>
//       ) : (
//         <p>Unexpected error occurred...</p>
//       )}
//     </div>
//   );
// };

// export default Home;
