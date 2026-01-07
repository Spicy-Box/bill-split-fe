import * as Sentry from "@sentry/react-native";
import { useRouter } from "expo-router";
import { View, Button, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function TestScreen() {
  const router = useRouter();

  // Test 1: Capture error
  const testError = () => {
    try {
      throw new Error("Test Error từ Divvy - Expo RN App");
    } catch (error) {
      Sentry.captureException(new Error("First error"));
    }
  };

  // // Test 2: Capture message
  const testMessage = () => {
    Sentry.captureMessage("Test Message: User clicked button", "info");
    console.log("Message captured");
  };

  // // Test 3: Manual transaction
  const testTransaction = () => {
    Sentry.startSpanManual(
      {
        name: "Manual Test Transaction",
        op: "test.operation",
      },
      (span) => {
        setTimeout(() => {
          span.end();
        }, 2000);
      }
    );
  };

  // // Test 4: Add breadcrumb
  const testBreadcrumb = () => {
    Sentry.addBreadcrumb({
      category: "user.action",
      message: "User performed test action",
      level: "info",
    });
  };

  return (
    <SafeAreaView>
      <Text style={{ fontSize: 18, marginBottom: 20 }}>Sentry Test Screen</Text>

      <Button title="Test Error" onPress={testError} />
      <Button title="Test Message" onPress={testMessage} />
      <Button title="Test Transaction" onPress={testTransaction} />
      <Button title="Test Breadcrumb" onPress={testBreadcrumb} />

      <Button title="Go Home" onPress={() => router.replace("/")}></Button>
    </SafeAreaView>
  );
}
