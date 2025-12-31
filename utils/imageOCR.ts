import { useRouter } from "expo-router";
import api from "@/utils/api";
import Toast from "react-native-toast-message";
import { useBillStore } from "@/stores/useBillStore";
import { ItemReponse } from "@/interfaces/api/bill.api";

// Implement what happens when the user chooses to use the photo
export const parseDataFromPhoto = (uri: string, router: ReturnType<typeof useRouter>) => {    
        
    // redirect to loading
    // upload image to ocr endpoint and parse result
    router.push("/bills/loading");

    const formData = new FormData();
    formData.append("file", {
        uri,
        type: "image/jpeg",
        name: "bill.jpg",
    } as any);

    // api.post("/bills/uploads", formData, {
    //     headers: {
    //     "Content-Type": "multipart/form-data",
    //     },
    // })
    //     .then((response) => {
    //     const parsedData = response.data;
    //     console.log("Parsed Data from OCR:", parsedData);
    //     // Redirect to add bill screen with parsed data
    //     router.replace({
    //         pathname: "/bills/add",
    //         params: { data: JSON.stringify(parsedData) },
    //     });
    //     })
    //     .catch((error) => {
    //     console.error("Error uploading image for OCR:", error);
    //     Toast.show({
    //         type: "error",
    //         text1: "Failed to process the image.",
    //     });
    //     router.back();
    //     });


    // fake api call
    setTimeout(() => {
        const parsedData: ItemReponse[] =  [
            {
                "id": "1",
                "name": "Sụn Gà Chiên Nước Mắm",
                "quantity": 3,
                "splitBetween": [],
                "splitType": "everyone",
                "totalPrice": 495000,
                "unitPrice": 165000
            },
            {
                "id": "2",
                "name": "Đậu Hũ Chiên Giòn",
                "quantity": 3,
                "splitBetween": [],
                "splitType": "everyone",
                "totalPrice": 255000,
                "unitPrice": 85000
            },
            {
                "id": "3",
                "name": "Hoành Thánh Hải Sản Chiên Giòn",
                "quantity": 3,
                "splitBetween": [],
                "splitType": "everyone",
                "totalPrice": 495000,
                "unitPrice": 165000
            },
            {
                "id": "4",
                "name": "Xúc Xích Nướng WNZ",
                "quantity": 1,
                "splitBetween": [],
                "splitType": "everyone",
                "totalPrice": 350000,
                "unitPrice": 350000
            },
            {
                "id": "5",
                "name": "Bò Warningzone",
                "quantity": 3,
                "splitBetween": [],
                "splitType": "everyone",
                "totalPrice": 645000,
                "unitPrice": 215000
            },
            {
                "id": "6",
                "name": "Cá Trứng Chiên Giòn",
                "quantity": 2,
                "splitBetween": [],
                "splitType": "everyone",
                "totalPrice": 310000,
                "unitPrice": 155000
            },
            {
                "id": "7",
                "name": "Giò Heo Muối Chiên Giòn",
                "quantity": 2,
                "splitBetween": [],
                "splitType": "everyone",
                "totalPrice": 530000,
                "unitPrice": 265000
            },
            {
                "id": "8",
                "name": "Cơm Chiên Hải Sản",
                "quantity": 2,
                "splitBetween": [],
                "splitType": "everyone",
                "totalPrice": 310000,
                "unitPrice": 155000
            },
            {
                "id": "9",
                "name": "Cơm Chiên Cá Mặn",
                "quantity": 1,
                "splitBetween": [],
                "splitType": "everyone",
                "totalPrice": 155000,
                "unitPrice": 155000
            },
            {
                "id": "10",
                "name": "Chân Gà Warningzone",
                "quantity": 1,
                "splitBetween": [],
                "splitType": "everyone",
                "totalPrice": 140000,
                "unitPrice": 150000
            },
            {
                "id": "13",
                "name": "Khoai Tây Chiên",
                "quantity": 5,
                "splitBetween": [],
                "splitType": "everyone",
                "totalPrice": 475000,
                "unitPrice": 95000
            },
            {
                "id": "14",
                "name": "Mì Xào Bò",
                "quantity": 2,
                "splitBetween": [],
                "splitType": "everyone",
                "totalPrice": 310000,
                "unitPrice": 155000
            },
            {
                "id": "15",
                "name": "Nước Ngọt Pepsi",
                "quantity": 6,
                "splitBetween": [],
                "splitType": "everyone",
                "totalPrice": 138000,
                "unitPrice": 23000
            },
            {
                "id": "16",
                "name": "Nước Suối",
                "quantity": 6,
                "splitBetween": [],
                "splitType": "everyone",
                "totalPrice": 138000,
                "unitPrice": 23000
            },
            {
                "id": "17",
                "name": "Nước Ngọt 7Up",
                "quantity": 3,
                "splitBetween": [],
                "splitType": "everyone",
                "totalPrice": 69000,
                "unitPrice": 23000
            },
            {
                "id": "18",
                "name": "Khăn Lạnh",
                "quantity": 17,
                "splitBetween": [],
                "splitType": "everyone",
                "totalPrice": 51000,
                "unitPrice": 3000
            },
            {
                "id": "19",
                "name": "Tháp Blanc 1664",
                "quantity": 3,
                "splitBetween": [],
                "splitType": "everyone",
                "totalPrice": 1257000,
                "unitPrice": 419000
            },
            {
                "id": "20",
                "name": "Tặng - Tháp Blanc 1664",
                "quantity": 1,
                "splitBetween": [],
                "splitType": "everyone",
                "totalPrice": 0,
                "unitPrice": 0
            }
        ]

        

        // Redirect to add bill screen with parsed data
        
        useBillStore.getState().setParsedData(parsedData);
        router.replace({
            pathname: "/bills/add",
            // params: { data: JSON.stringify(parsedData) },
        });        

    }, 500);
};
