import { CameraView, CameraType, useCameraPermissions } from "expo-camera";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import { Button, Text, TouchableOpacity, View } from "react-native";
import { IconButton } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { Gesture, GestureDetector, GestureHandlerRootView } from "react-native-gesture-handler";

export default function CameraScreen() {
  const router = useRouter();

  const [facing, setFacing] = useState<CameraType>("back");
  const [permission, requestPermission] = useCameraPermissions();
  const [zoom, setZoom] = useState(0);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const cameraRef = useRef<CameraView>(null);
  const zoomRef = useRef(0);
  const pinchStartZoomRef = useRef(0);

  const toggleCameraFacing = () => {
    setFacing((current) => (current === "back" ? "front" : "back"));
  };

  const handleCancle = () => {
    router.back();
  };

  const takePicture = async () => {
    if (!cameraRef.current) return;

    const photo = await cameraRef.current.takePictureAsync({
      quality: 0.8,
    });

    setPhotoUri(photo.uri);
  };

  const pinchGesture = Gesture.Pinch()
    // Execute handler on JS thread to avoid runOnJS and crashes
    .runOnJS(true)
    .onBegin(() => {
      pinchStartZoomRef.current = zoomRef.current;
    })
    .onUpdate((e) => {
      // Slightly higher sensitivity for smoother feel
      const rawZoom = pinchStartZoomRef.current + (e.scale - 1) * 0.13;
      const clampedZoom = Math.min(Math.max(rawZoom, 0), 1);

      // only skip very tiny jitter; allow more frequent updates
      if (Math.abs(clampedZoom - zoomRef.current) < 0.003) return;

      zoomRef.current = clampedZoom;
      // console.log(clampedZoom);
      setZoom(clampedZoom);
    });

  if (!permission) {
    return <SafeAreaView />;
  }

  if (!permission.granted) {
    return (
      <SafeAreaView>
        <Text>We need your permission to show the camera</Text>
        <Button onPress={requestPermission} title="grant permission" />
      </SafeAreaView>
    );
  }
  if (!photoUri) {
    return (
      <>
        <GestureHandlerRootView>
          <SafeAreaView className="flex-1 bg-dark1">
            <GestureDetector gesture={pinchGesture}>
              <View className="flex-1">
                <CameraView style={{ flex: 1 }} facing={facing} ref={cameraRef} zoom={zoom} />
                <View className="bg-primary1 items-center px-5 py-2 flex-row justify-between">
                  <TouchableOpacity onPress={handleCancle}>
                    <Text>Cancel</Text>
                  </TouchableOpacity>
                  <IconButton icon={"camera-iris"} size={30} onPress={takePicture} />
                  <IconButton icon={"camera-flip"} size={30} onPress={toggleCameraFacing} />
                </View>
              </View>
            </GestureDetector>
          </SafeAreaView>
        </GestureHandlerRootView>
      </>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-dark1">
      <View className="flex-1">
        <Image source={{ uri: photoUri }} style={{ flex: 1 }} />
        <View className="bg-primary1 items-center px-5 py-5 flex-row justify-between">
          <TouchableOpacity onPress={() => setPhotoUri(null)}>
            <Text className="text-xl">Retake</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.back()}>
            <Text className="text-xl">Use Photo</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
