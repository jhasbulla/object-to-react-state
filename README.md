# 🚀 Object to React State

> Revolutionize State Management in React!

Ever wished updating state in React could be simpler, without the constant struggle with immutability? **object-to-react-state** radically transforms the way you handle state, combining powerful reactivity with the simplicity of traditional JavaScript objects.

---

## ✨ Why You'll Love This Library

- **Granular Updates:**  
  No more recreating entire data structures for minor changes. The library observes your object’s properties and triggers targeted re-renders automatically, updating only what's necessary—leading to better performance and cleaner code.

- **Less Boilerplate, More Freedom:**  
  Focus solely on what truly matters! Modify your state directly, without worrying about cloning or manually replacing objects. Let the library handle the rest, keeping your code intuitive and free from unnecessary complexity.

- **Simplified Management of Complex States:**  
  Nested states and intricate structures won't be headaches anymore. Effortlessly update individual properties, dramatically improving your code's readability and maintainability.

- **Enhanced Developer Experience:**  
  Say goodbye to tricky immutability-related bugs! Enjoy a clear and intuitive data flow that simplifies debugging, ensures state consistency, and reflects changes instantly in your UI.

---

## 📚 Table of Contents
- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [API](#api)
- [Contributing](#contributing)
- [License (MIT)](#license-mit)

---

## 🛠️ Features
- **Reactive Objects:** Automatically patches objects so that changes trigger re-renders.
- **Supports Class Instances & Plain Objects:** Use with both simple objects and more complex class instances.
- **Polling for New Properties:** Optionally poll for new properties and patch them on the fly.
- **Easy Integration:** Seamlessly integrate into your React projects with a custom hook.

---

## 📦 Installation

Install using npm:

```bash
npm install @jhasbulla/object-to-react-state
```

---

## ⚙️ Usage

Import the **useObjectToState** hook and wrap your object.<br>
Any updates to properties of yourObject will automatically trigger a re-render in your component.

Below is a basic example demonstrating how to use the library with both a plain object and a class instance:

```jsx
import { useEffect } from 'react';
import { useObjectToState } from '@jhasbulla/object-to-react-state';  

class Person {
  name: string;
  private _age: number;

  constructor(name: string, age: number) {
    this.name = name;
    this._age = age;

    // Simulate an asynchronous update to the age after 2 seconds.
    setTimeout(() => {
      this._age = 40;
    }, 2000);
  }

  get age() {
    return this._age;
  }

  set age(newAge: number) {
    this._age = newAge + 1;
  }
}

const plainObject: any = { 
  name: 'Mario', 
  age: 30, 
  nested: { value: 1 } 
};
const personInstance = new Person('Mario', 30);

export function MyComponent() {
  // Wrap the class instance and plain object in state.
  const personState = useObjectToState(personInstance);
  const objectState = useObjectToState(plainObject, { unsafePollingForAddedProperties: true });

  useEffect(() => {
    console.log("useEffect triggered due to age change");
  }, [personState.age]);

  return (
    <>
      <div>
        <h3>Plain Object</h3>
        <div>
          <strong>Name:</strong> {objectState.name}
        </div>
        <div>
          <strong>Age:</strong> {objectState.age}
        </div>
        <div>
          <strong>Nested Value:</strong> {objectState.nested.value}
        </div>
        <div>
          <strong>Test Property:</strong> {objectState.test}
        </div>
        <button
          onClick={() => {
            plainObject.age++;
            plainObject.nested.value++;
            console.log(plainObject);
          }}
        >
          Increment Age
        </button>
        <br />
        <button
          onClick={() => {
            plainObject.test = "hello";
          }}
        >
          Add Property
        </button>
        <br />
        <button
          onClick={() => {
            plainObject.test = "hello2";
          }}
        >
          Change Property
        </button>
      </div>
      <br />
      <div>
        <h3>Class Instance</h3>
        <div>
          <strong>Name:</strong> {personState.name}
        </div>
        <div>
          <strong>Age:</strong> {personState.age}
        </div>
        <button
          onClick={() => {
            personInstance.age++;
          }}
        >
          Increment Age
        </button>
      </div>
    </>
  );
}

```

---

## 🔗 API

### `useObjectToState`
Transforms an object into a reactive object that triggers re-renders on property changes.

**Parameters:**
- `obj` (object): The object to be made reactive.
- `options` (optional): An object with the following properties:
  - `unsafePollingForAddedProperties` (boolean, default: `false`): If set to `true`, the hook will periodically check for new properties added to the object and patch them.
  - `pollingInterval` (number, default: `1000`): The time interval (in milliseconds) between polls for new properties.

**Returns:**
- The same object, now enhanced with reactive capabilities.

---

## 🤝 Contributing
Contributions are welcome! To contribute:

1. Fork the repository.
2. Create a new branch for your feature or bugfix.
3. Commit your changes with clear, descriptive messages.
4. Submit a pull request for review.

For major changes, please open an issue first to discuss what you would like to change.

---

## 📄 License (MIT)
This project is licensed under the [MIT License](LICENSE).
