import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import styled from "styled-components";
import { PrimaryButton } from "./CommonStyled";
import { productsCreate } from "../../slices/productsSlice";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";

const CreateProduct = () => {
    const dispatch = useDispatch();
    const { createStatus } = useSelector((state) => state.products);

    const [name, setName] = useState("");
    const [basePrice, setBasePrice] = useState("");
    const [taxRate, setTaxRate] = useState("");
    const [deliveryCharge, setDeliveryCharge] = useState("");
    const [desc, setDesc] = useState("");
    const [newBrand, setNewBrand] = useState("");

    const [brandOptions, setBrandOptions] = useState(
        JSON.parse(localStorage.getItem("brandOptions")) || ["Select Brand", "Other"]
    );

    const [selectedBrand, setSelectedBrand] = useState(
        localStorage.getItem("selectedBrand") || "Select Brand"
    );

    const handleBrandChange = (e) => {
        const selectedValue = e.target.value;
        setSelectedBrand(selectedValue);
        localStorage.setItem("selectedBrand", selectedValue);
    };

    const handleNewBrandChange = (e) => {
        setNewBrand(e.target.value);
    };

    const handleAddNewBrand = () => {
        if (newBrand.trim() === "") {
            toast.error("Please enter a valid brand name.");
        } else {
            const newBrandOptions = [...brandOptions, newBrand];
            setBrandOptions(newBrandOptions);
            setSelectedBrand(newBrand);
            setNewBrand("");
            localStorage.setItem("brandOptions", JSON.stringify(newBrandOptions));
            localStorage.setItem("selectedBrand", newBrand);
        }
    };

    const [productImages, setProductImages] = useState([]);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const handleProductImageUpload = (e) => {
        const files = Array.from(e.target.files);

        const filePromises = files.map((file) => {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result);
                reader.onerror = reject;
                reader.readAsDataURL(file);
            });
        });

        Promise.all(filePromises)
            .then((imageDataUrls) => {
                setProductImages(imageDataUrls);
            })
            .catch((error) => {
                console.error("Error reading image files:", error);
            });
    };

    const handleCarouselChange = (index) => {
        setCurrentImageIndex(index);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        dispatch(
            productsCreate({
                name,
                brand: selectedBrand,
                desc,
                price:basePrice,
                images: productImages,
                taxRate,
                deliveryCharge,
            })
        );
    };

    useEffect(() => {
        // Whenever brandOptions change, update the selectedBrand state if it's not in brandOptions
        if (!brandOptions.includes(selectedBrand)) {
            setSelectedBrand("Select Brand");
        }
    }, [brandOptions, selectedBrand]);

    return (
        <>
            <StyledCreateProduct>
                <StyledForm onSubmit={handleSubmit}>
                    <h3>Create a Product</h3>
                    <input
                        id="imgUpload"
                        accept="image/*"
                        type="file"
                        onChange={handleProductImageUpload}
                        multiple
                        required
                    />
                    <div>
                        <label>Brand:</label>
                        <select
                            value={selectedBrand}
                            onChange={handleBrandChange}
                            required
                        >
                            {brandOptions.map((option, index) => (
                                <option key={index} value={option}>
                                    {option}
                                </option>
                            ))}
                        </select>
                        {selectedBrand === "Other" && (
                            <div>
                                <input
                                    type="text"
                                    placeholder="New Brand"
                                    value={newBrand}
                                    onChange={handleNewBrandChange}
                                />
                                <button type="button" onClick={handleAddNewBrand}>
                                    Add
                                </button>
                            </div>
                        )}
                    </div>
                    <input
                        type="text"
                        placeholder="Name"
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                    <input
                        type="number"
                        placeholder="Base Price"
                        onChange={(e) => setBasePrice(e.target.value)}
                        required
                    />
                    <input
                        type="number"
                        placeholder="Tax Rate"
                        onChange={(e) => setTaxRate(e.target.value)}
                    />
                    <input
                        type="number"
                        placeholder="Delivery Charge"
                        onChange={(e) => setDeliveryCharge(e.target.value)}
                    />
                    <input
                        type="text"
                        placeholder="Short Description"
                        onChange={(e) => setDesc(e.target.value)}
                        required
                    />

                    <PrimaryButton type="submit">
                        {createStatus === "pending" ? "Submitting" : "Submit"}
                    </PrimaryButton>
                </StyledForm>
                <ImageCarousel>
                    <Carousel
                        selectedItem={currentImageIndex}
                        onChange={handleCarouselChange}
                    >
                        {productImages.map((imageUrl, index) => (
                            <div key={index}>
                                <img src={imageUrl} alt={`Product Preview ${index}`} />
                            </div>
                        ))}
                    </Carousel>
                </ImageCarousel>
            </StyledCreateProduct>
            <ToastContainer />
        </>
    );
};

export default CreateProduct;

const ImageCarousel = styled.div`
  /* margin-top: 20px;
  max-width: 100%;
  overflow: hidden; */
     margin: 2rem 0 2rem 2rem;
   padding: 2rem;
   border: 1px solid rgb(183, 183, 183);
   max-width: 300px;
   width: 100%;
   display: flex;
   align-items: center;
   justify-content: center;
   padding: 2rem;
   color: rgb(78, 78, 78);

   img {
     max-width: 100%;
   }
`;

const StyledForm = styled.form`
  display: flex;
  flex-direction: column;
  max-width: 300px;
  margin-top: 2rem;

  select,
  input {
    padding: 7px;
    min-height: 30px;
    outline: none;
    border-radius: 5px;
    border: 1px solid rgb(182, 182, 182);
    margin: 0.3rem 0;

    &:focus {
      border: 2px solid rgb(0, 208, 255);
    }
  }

  select {
    color: rgb(95, 95, 95);
  }
`;

const StyledCreateProduct = styled.div`
  display: flex;
  justify-content: space-between;
`;

// const ImagePreview = styled.div`
//   margin: 2rem 0 2rem 2rem;
//   padding: 2rem;
//   border: 1px solid rgb(183, 183, 183);
//   max-width: 300px;
//   width: 100%;
//   display: flex;
//   align-items: center;
//   justify-content: center;
//   padding: 2rem;
//   color: rgb(78, 78, 78);

//   img {
//     max-width: 100%;
//   }
// `;


// QUILLO
// import React, { useState, useEffect } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import styled from "styled-components";
// import { PrimaryButton } from "./CommonStyled";
// import { productsCreate } from "../../slices/productsSlice";
// import { ToastContainer, toast } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import ReactQuill from 'react-quill';
// import 'react-quill/dist/quill.snow.css';

// const CreateProduct = () => {
//     const dispatch = useDispatch();
//     const { createStatus } = useSelector((state) => state.products);

//     const [productImg, setProductImg] = useState("");
//     const [name, setName] = useState("");
//     const [price, setPrice] = useState("");
//     const [desc, setDesc] = useState("");
//     const [newBrand, setNewBrand] = useState("");



//     const [brandOptions, setBrandOptions] = useState(
//         JSON.parse(localStorage.getItem("brandOptions")) || ["Select Brand", "Other"]
//     );

//     const [selectedBrand, setSelectedBrand] = useState(
//         localStorage.getItem("selectedBrand") || "Select Brand"
//     );

//     const handleProductImageUpload = (e) => {
//         const file = e.target.files[0];

//         if (file) {
//             const fileSize = file.size;
//             const maxSize = 5 * 1024 * 1024; // 5MB in bytes

//             if (fileSize <= maxSize) {
//                 TransformFileData(file);
//             } else {
//                 toast.error("Image size exceeds 5MB. Please select a smaller image.");
//             }
//         } else {
//             setProductImg("");
//         }
//     };

//     const TransformFileData = (file) => {
//         const reader = new FileReader();

//         if (file) {
//             reader.readAsDataURL(file);
//             reader.onloadend = () => {
//                 setProductImg(reader.result);
//             };
//         } else {
//             setProductImg("");
//         }
//     };

//     const handleBrandChange = (e) => {
//         const selectedValue = e.target.value;
//         setSelectedBrand(selectedValue);
//         localStorage.setItem("selectedBrand", selectedValue);
//     };

//     const handleNewBrandChange = (e) => {
//         setNewBrand(e.target.value);
//     };

//     const handleAddNewBrand = () => {
//         if (newBrand.trim() === "") {
//             toast.error("Please enter a valid brand name.");
//         } else {
//             const newBrandOptions = [...brandOptions, newBrand];
//             setBrandOptions(newBrandOptions);
//             setSelectedBrand(newBrand);
//             setNewBrand("");
//             // Update the brandOptions in localStorage
//             localStorage.setItem("brandOptions", JSON.stringify(newBrandOptions));
//             // Update the selected brand in localStorage
//             localStorage.setItem("selectedBrand", newBrand);
//         }
//     };

//     const handleSubmit = async (e) => {
//         e.preventDefault();

//         dispatch(
//             productsCreate({
//                 name,
//                 brand: selectedBrand,
//                 price,
//                 desc,
//                 image: productImg,
//             })
//         );
//     };

//     useEffect(() => {
//         // Whenever brandOptions change, update the selectedBrand state if it's not in brandOptions
//         if (!brandOptions.includes(selectedBrand)) {
//             setSelectedBrand("Select Brand");
//         }
//     }, [brandOptions, selectedBrand]);

//     const handleQuillChange = (value) => {
//         setDesc(value);
//     };


//     return (
//         <>
//             <StyledCreateProduct>
//                 <StyledForm onSubmit={handleSubmit}>
//                     <h3>Create a Product</h3>
//                     <input
//                         id="imgUpload"
//                         accept="image/*"
//                         type="file"
//                         onChange={handleProductImageUpload}
//                         required
//                     />
//                     <div>
//                         <label>Brand:</label>
//                         <select
//                             value={selectedBrand}
//                             onChange={handleBrandChange}
//                             required
//                         >
//                             {brandOptions.map((option, index) => (
//                                 <option key={index} value={option}>
//                                     {option}
//                                 </option>
//                             ))}
//                         </select>
//                         {selectedBrand === "Other" && (
//                             <div>
//                                 <input
//                                     type="text"
//                                     placeholder="New Brand"
//                                     value={newBrand}
//                                     onChange={handleNewBrandChange}
//                                 />
//                                 <button type="button" onClick={handleAddNewBrand}>
//                                     Add
//                                 </button>
//                             </div>
//                         )}
//                     </div>
//                     <input
//                         type="text"
//                         placeholder="Name"
//                         onChange={(e) => setName(e.target.value)}
//                         required
//                     />
//                     <input
//                         type="number"
//                         placeholder="Price"
//                         onChange={(e) => setPrice(e.target.value)}
//                         required
//                     />
//                     <ReactQuill
//                         value={desc}
//                         onChange={handleQuillChange}
//                         placeholder="Short Description"
//                     />
//                     <PrimaryButton type="submit">
//                         {createStatus === "pending" ? "Submitting" : "Submit"}
//                     </PrimaryButton>
//                 </StyledForm>
//                 <ImagePreview>
//                     {productImg ? (
//                         <>
//                             <img src={productImg} alt="Product Preview" />
//                         </>
//                     ) : (
//                         <p>Product image upload preview will appear here!</p>
//                     )}
//                 </ImagePreview>
//             </StyledCreateProduct>
//             <ToastContainer />
//         </>
//     );
// };

// export default CreateProduct;