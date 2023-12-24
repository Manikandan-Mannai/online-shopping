import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { productsEdit } from "../../slices/productsSlice";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "react-multi-carousel/lib/styles.css";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import styled from "styled-components";
import { PrimaryButton } from "./CommonStyled";
import { Carousel } from "react-responsive-carousel";

export default function EditProduct({ prodID }) {
    const dispatch = useDispatch();
    const { items } = useSelector((state) => state.products);
    const { editStatus } = useSelector((state) => state.products);

    const [open, setOpen] = useState(false);
    const [currentProd, setCurrentProd] = useState({});
    const [previewImages, setPreviewImages] = useState([]);
    const [productImages, setProductImages] = useState([]);
    const [brand, setBrand] = useState('');
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [desc, setDesc] = useState('');
    const [newBrand, setNewBrand] = useState('');
    const [taxRate, setTaxRate] = useState('');
    const [deliveryCharge, setDeliveryCharge] = useState('');

    const [brandOptions, setBrandOptions] = useState(
        JSON.parse(localStorage.getItem('brandOptions')) || [
            'Select Brand',
            'iPhone',
            'Samsung',
            'Xiomi',
            'Other',
        ]
    );

    const handleProductImageUpload = (e) => {
        const files = Array.from(e.target.files);

        const images = [];
        const maxSize = 5 * 1024 * 1024;

        files.forEach((file) => {
            if (file.size <= maxSize) {
                const reader = new FileReader();
                reader.onloadend = () => {
                    images.push(reader.result);
                    if (images.length === files.length) {
                        setPreviewImages(images);
                        setProductImages(files);
                    }
                };
                reader.readAsDataURL(file);
            } else {
                toast.error('Image size exceeds 5MB. Please select smaller images.');
            }
        });
    };



    const handleSubmit = async (e) => {
        e.preventDefault();

        dispatch(
            productsEdit({
                productImages,
                product: {
                    ...currentProd,
                    name,
                    brand,
                    price,
                    desc,
                    taxRate,
                    deliveryCharge,
                },
            })
        );
    };

    const handleClickOpen = () => {
        setOpen(true);
        let selectedProd = items.find((item) => item._id === prodID);

        setCurrentProd(selectedProd);
        setPreviewImages(selectedProd.images.map((img) => img.url));
        setBrand(selectedProd.brand);
        setName(selectedProd.name);
        setPrice(selectedProd.price);
        setDesc(selectedProd.desc);
        setTaxRate(selectedProd.tax);
        setDeliveryCharge(selectedProd.deliveryCharge);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleAddNewBrand = () => {
        if (newBrand.trim() === '') {
            toast.error('Please enter a valid brand name.');
        } else {
            setBrand(newBrand);
            setNewBrand('');
            const newBrandOptions = [...brandOptions, newBrand];
            setBrandOptions(newBrandOptions);
            localStorage.setItem('brandOptions', JSON.stringify(newBrandOptions));
        }
    };

    useEffect(() => {
        if (!brandOptions.includes(brand)) {
            setBrand('Select Brand');
        }
    }, [brandOptions, brand]);

    return (
        <div>
            <Edit onClick={handleClickOpen}>Edit</Edit>
            <Dialog open={open} onClose={handleClose} fullWidth={true} maxWidth={'md'}>
                <DialogTitle>Edit Product</DialogTitle>
                <DialogContent>
                    <StyledEditProduct>
                        <StyledForm onSubmit={handleSubmit}>
                            <h3>Edit Product</h3>
                            <input
                                id="imgUpload"
                                accept="image/*"
                                type="file"
                                onChange={handleProductImageUpload}
                                multiple // Enable multiple file selection
                            />
                            <select onChange={(e) => setBrand(e.target.value)} value={brand}>
                                {brandOptions.map((option, index) => (
                                    <option key={index} value={option}>
                                        {option}
                                    </option>
                                ))}
                            </select>
                            {brand === 'Other' && (
                                <div>
                                    <input
                                        type="text"
                                        placeholder="New Brand"
                                        value={newBrand}
                                        onChange={(e) => setNewBrand(e.target.value)}
                                    />
                                    <button type="button" onClick={handleAddNewBrand}>
                                        Add
                                    </button>
                                </div>
                            )}
                            <input
                                type="text"
                                placeholder="Name"
                                onChange={(e) => setName(e.target.value)}
                                value={name}
                            />
                            <input
                                type="number"
                                placeholder="Price"
                                onChange={(e) => setPrice(e.target.value)}
                                value={price}
                            />
                            <input
                                type="number"
                                placeholder="Tax Rate"
                                onChange={(e) => setTaxRate(e.target.value)}
                                value={taxRate}
                            />
                            <input
                                type="number"
                                placeholder="Delivery Charge"
                                onChange={(e) => setDeliveryCharge(e.target.value)}
                                value={deliveryCharge}
                            />
                            <input
                                type="text"
                                placeholder="Short Description"
                                onChange={(e) => setDesc(e.target.value)}
                                value={desc}
                            />

                            <PrimaryButton type="submit">
                                {editStatus === 'pending' ? 'Updating' : 'Update'}
                            </PrimaryButton>
                        </StyledForm>
                        <ImagePreview>
                            {previewImages.length > 0 ? (
                                <Carousel>
                                    {previewImages.map((img, index) => (
                                        <div key={index}>
                                            <img src={img} alt={`Product Preview ${index + 1}`} />
                                        </div>
                                    ))}
                                </Carousel>
                            ) : (
                                <p>Product image upload preview will appear here!</p>
                            )}
                        </ImagePreview>
                    </StyledEditProduct>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="primary">
                        Cancel
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}


const Edit = styled.button`
  border: none;
  outline: none;
  padding: 3px 5px;
  color: white;
  border-radius: 3px;
  cursor: pointer;
  background-color: #4b70e2;
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

const StyledEditProduct = styled.div`
  display: flex;
  justify-content: space-between;
`;

const ImagePreview = styled.div`
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

