# Course Import File Format

You can import course details by uploading a `.txt` file with the following format:

## Format Example

```
COURSE_TITLE: Introduction to IoT
COURSE_DESCRIPTION: Learn the fundamentals of Internet of Things including sensors, actuators, and connectivity.
CATEGORY: Technology
PRICE: 999

LESSON_1_TITLE: What is IoT?
LESSON_1_DESCRIPTION: Introduction to Internet of Things concepts and real-world applications.

LESSON_2_TITLE: IoT Hardware Components
LESSON_2_DESCRIPTION: Understanding sensors, microcontrollers, and communication modules.

LESSON_3_TITLE: Connectivity Protocols
LESSON_3_DESCRIPTION: Exploring MQTT, HTTP, and other IoT communication protocols.
```

## Field Definitions

### Required Course Fields:
- `COURSE_TITLE`: The name of your course
- `COURSE_DESCRIPTION`: Detailed description of what the course covers
- `CATEGORY`: Course category (e.g., Technology, Business, Design)
- `PRICE`: Course price in rupees (numeric value)

### Optional Lesson Fields:
- `LESSON_X_TITLE`: Title for lesson X (where X is 1, 2, 3, etc.)
- `LESSON_X_DESCRIPTION`: Description for lesson X

## Rules:
1. Each field should be on a new line
2. Use the exact field names shown above (case-insensitive)
3. Separate field name and value with a colon `:`
4. Lessons are numbered starting from 1
5. You can have unlimited lessons (LESSON_1, LESSON_2, LESSON_3, etc.)
6. Empty lines are ignored
7. After importing, you'll still need to upload video files and documents for each lesson

## Notes:
- The import only fills in text fields
- After import, you'll still upload videos and documents manually
- You can edit any imported fields before final submission
