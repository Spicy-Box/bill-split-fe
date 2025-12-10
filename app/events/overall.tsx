import {
  AddBillMenuModal,
  AlbumPickerModal,
  BillsList,
  EventHeader,
  StatsCard,
  type AlbumThumb,
  type Bill,
  type EventNameAndCurrency,
  type EventStats,
} from "@/components/EventOverall";
import { useRouter } from "expo-router";
import { Plus } from "lucide-react-native";
import { useState } from "react";
import { Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as MediaLibrary from "expo-media-library";

const EVENT_DATA: EventNameAndCurrency = {
  name: "Camping Trip 2025",
  date: "27-10-2025",
  emoji: "🤗",
};

const STATS_DATA: EventStats = {
  myExpenses: 20.5,
  totalExpenses: 20.5,
};

const BILLS_DATA: Bill[] = [
  { id: "1", name: "Oyasumi Punpun", amount: 455000, paidBy: "John" },
  { id: "2", name: "Oyasumi Punpun", amount: 455000, paidBy: "Jane" },
  { id: "3", name: "Oyasumi Punpun", amount: 455000, paidBy: "Mike" },
  { id: "4", name: "Oyasumi Punpun", amount: 455000, paidBy: "Sarah" },
];

const ALBUM_PAGE_SIZE = 60;

export default function OverallScreen() {
  const router = useRouter();
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [albums, setAlbums] = useState<MediaLibrary.Album[]>([]);
  const [selectedAssetUri, setSelectedAssetUri] = useState<string | null>(null);
  const [showAlbumPicker, setShowAlbumPicker] = useState(false);
  const [albumAssets, setAlbumAssets] = useState<AlbumThumb[]>([]);
  const [selectedAlbumId, setSelectedAlbumId] = useState<string | null>(null);
  const [albumEndCursor, setAlbumEndCursor] = useState<string | null>(null);
  const [albumHasNextPage, setAlbumHasNextPage] = useState(false);
  const [isLoadingAlbum, setIsLoadingAlbum] = useState(false);

  const loadAlbumAssets = async (album: MediaLibrary.Album, options?: { append?: boolean }) => {
    const append = options?.append ?? false;

    if (!append) {
      setAlbumAssets([]);
      setAlbumEndCursor(null);
      setAlbumHasNextPage(false);
    }

    setIsLoadingAlbum(true);
    setSelectedAlbumId(album.id);

    const albumAssets = await MediaLibrary.getAssetsAsync({
      album,
      first: ALBUM_PAGE_SIZE,
      after: append ? albumEndCursor ?? undefined : undefined,
      sortBy: MediaLibrary.SortBy.creationTime,
      mediaType: [MediaLibrary.MediaType.photo], // chỉ lấy ảnh, bỏ video
    });

    const withLocalUris = await Promise.all(
      albumAssets.assets.map(async (asset) => {
        const info = await MediaLibrary.getAssetInfoAsync(asset);
        return { id: asset.id, uri: info.localUri ?? asset.uri ?? null };
      })
    );

    setAlbumAssets((prev) => (append ? [...prev, ...withLocalUris] : withLocalUris));
    setAlbumEndCursor(albumAssets.endCursor ?? null);
    setAlbumHasNextPage(albumAssets.hasNextPage);
    setIsLoadingAlbum(false);
  };

  const ensureMediaLibraryPermission = async () => {
    const { status, canAskAgain } = await MediaLibrary.getPermissionsAsync();

    if (status === "granted") return true;

    if (status === "denied" && !canAskAgain) {
      Alert.alert("Permission denied", "Please enable Photos permission in Settings.");
      return false;
    }

    const permission = await MediaLibrary.requestPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission required", "Permission to access the media library is required.");
      return false;
    }

    return true;
  };

  const handleOpenCamera = () => {
    setShowAddMenu(false);

    router.push("/events/camera");
    // TODO: Implement camera functionality
  };

  const handleUploadBill = async () => {
    setShowAddMenu(false);
    setSelectedAssetUri(null);
    // Open album via MediaLibrary: ensure permission, fetch albums, then let user tap a thumbnail
    if (!(await ensureMediaLibraryPermission())) return;

    const fetchedAlbums = await MediaLibrary.getAlbumsAsync({ includeSmartAlbums: true });
    setAlbums(fetchedAlbums);

    if (!fetchedAlbums.length) {
      Alert.alert("No albums found", "You have no albums to select from.");
      return;
    }

    const preferredTitles = [
      "Recents",
      "Recent",
      "Recently Added",
      "All Photos",
      "All photos",
      "Camera",
    ];
    const defaultAlbum =
      fetchedAlbums.find((a) => preferredTitles.includes(a.title)) ?? fetchedAlbums[0];

    await loadAlbumAssets(defaultAlbum);
    setShowAlbumPicker(true);
  };

  const handleCreateBill = () => {
    setShowAddMenu(false);
    router.push("/bills/add");
  };

  return (
    <>
      <SafeAreaView className="bg-primary1" edges={["top"]} />
      <View className="flex-1">
        <EventHeader eventNameAndCurrency={EVENT_DATA} />

        {/* Body */}
        <ScrollView className="flex-1 px-5 pt-5" showsVerticalScrollIndicator={false}>
          <StatsCard stats={STATS_DATA} />
          <BillsList bills={BILLS_DATA} />
          {selectedAssetUri && (
            <Text className="mt-4 text-xs text-dark1">Selected media: {selectedAssetUri}</Text>
          )}
        </ScrollView>

        {/* Add Bill FAB */}
        <View className="absolute bottom-8 left-0 right-0 items-center z-10">
          <TouchableOpacity
            onPress={() => setShowAddMenu(true)}
            className="items-center gap-1"
            activeOpacity={0.7}
          >
            <View className="w-8 h-8 bg-primary3 rounded-full items-center justify-center">
              <Plus size={20} color="white" />
            </View>
            <View className="bg-primary3 rounded-2xl px-4 py-1">
              <Text className="text-light1 text-center text-xs font-semibold font-inter">
                Add Bill
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        <AddBillMenuModal
          visible={showAddMenu}
          onClose={() => setShowAddMenu(false)}
          onOpenCamera={handleOpenCamera}
          onUploadBill={handleUploadBill}
          onCreateBill={handleCreateBill}
        />
        <AlbumPickerModal
          visible={showAlbumPicker}
          albums={albums}
          selectedAlbumId={selectedAlbumId}
          assets={albumAssets}
          hasNextPage={albumHasNextPage}
          loadingMore={isLoadingAlbum}
          onClose={() => setShowAlbumPicker(false)}
          onSelectAlbum={async (album) => {
            await loadAlbumAssets(album);
          }}
          onSelectAsset={(uri) => {
            setSelectedAssetUri(uri);
            setShowAlbumPicker(false);
          }}
          onLoadMore={async () => {
            const selectedAlbum = selectedAlbumId
              ? albums.find((a) => a.id === selectedAlbumId)
              : null;
            if (selectedAlbum && albumHasNextPage && !isLoadingAlbum) {
              await loadAlbumAssets(selectedAlbum, { append: true });
            }
          }}
        />
      </View>
    </>
  );
}
