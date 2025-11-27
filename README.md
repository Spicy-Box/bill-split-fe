# Welcome to Divvy Split App 👋

[![React Native CI - Test, Report & SonarCloud](https://github.com/Spicy-Box/bill-split-fe/actions/workflows/test.yml/badge.svg)](https://github.com/Spicy-Box/bill-split-fe/actions/workflows/test.yml) [![Quality gate](https://sonarcloud.io/api/project_badges/quality_gate?project=Spicy-Box_bill-split-fe)](https://sonarcloud.io/summary/new_code?id=Spicy-Box_bill-split-fe)

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## 🧪 Testing Guide

This project uses **Jest** and **React Native Testing Library** to test both UI components and application logic.

### 1. Run all tests

```bash
npm run test
```

This command will:

- Execute all test files inside the `__tests__/` directory
- Display pass/fail results in the terminal
- Automatically watch file changes in development mode

### 2. Run tests with coverage report

```bash
npm run test:coverage
```

This command will:

- Generate a **coverage report**
- Export results to:

```
coverage/
└── index.html
```

You can open `coverage/index.html` in your browser to view a detailed coverage dashboard (statements, branches, functions, lines).

<!-- ## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions. -->
