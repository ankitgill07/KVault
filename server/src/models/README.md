# Course Mongoose Schemas Documentation

This directory contains comprehensive, interconnected Mongoose schemas for a Learning Management System (LMS).

## 📁 Schema Architecture

All schemas are **separate files** but **connected through references**, making data retrieval efficient and maintaining clean separation of concerns.

```
Category (Course Categories)
    ↓
Course (Main Course Information)
    ↓
Module (Course Sections/Chapters)
    ↓
Lesson (Individual Lessons)
    ↓
    ├── Resource (Downloadable Files)
    └── Quiz (Assessments)
            ↓
        Question (Quiz Questions)
            ↓
        Option (Answer Options)
            ↓
        QuizAttempt (Student Attempts)
            ↓
        Answer (Student Answers)

Enrollment (Student Course Enrollment)
Review (Course Reviews/Ratings)
```

## 🗂️ Schema Files

### 1. **categoryModel.ts** - Course Categories
- Hierarchical category structure (parent/child categories)
- Auto-generates URL-friendly slugs
- Tracks course count per category
- Supports icons and images

**Key Fields:**
- `name`, `slug`, `description`
- `parentCategory` (for subcategories)
- `subcategories` (array of child categories)
- `isActive`, `courseCount`

### 2. **courseModel.ts** - Main Course Schema
- Comprehensive course information
- Supports multiple instructors
- Pricing and discount management
- SEO optimization fields
- Auto-publishing with timestamps

**Key Fields:**
- `title`, `slug`, `description`
- `category` → references Category
- `instructors` → references User[]
- `primaryInstructor` → references User
- `price`, `discountPrice`, `currency`
- `level`, `language`, `tags`
- `rating`, `enrollmentCount`, `viewCount`
- `prerequisites` → references Course[]

**Instance Methods:**
- `getEnrollmentRate()` - Calculate enrollment percentage
- `getDiscountedPrice()` - Get current price with discount

### 3. **moduleModel.ts** - Course Modules/Sections
- Organizes lessons into logical sections
- Auto-updates course module count
- Supports free preview modules

**Key Fields:**
- `course` → references Course
- `title`, `description`, `order`
- `duration`, `totalLessons`
- `isPublished`, `isFree`

**Instance Methods:**
- `getDurationFormatted()` - Returns "2h 30m" format

### 4. **lessonModel.ts** - Individual Lessons
- Supports multiple content types (video, text, markdown, etc.)
- Links to resources and quizzes
- Tracks views and completions

**Key Fields:**
- `module` → references Module
- `course` → references Course
- `title`, `description`, `order`
- `contentType` (video, text, markdown, etc.)
- `videoUrl`, `videoDuration`, `videoProvider`
- `textContent`, `markdownContent`
- `resources` → references Resource[]
- `quiz` → references Quiz
- `isPublished`, `isFree`, `isPreview`

**Instance Methods:**
- `getDurationFormatted()` - Returns "45m" format
- `getVideoDurationFormatted()` - Returns "12:30" format

### 5. **resourceModel.ts** - Lesson Resources
- Downloadable files attached to lessons
- Tracks download counts
- Supports multiple file types

**Key Fields:**
- `lesson` → references Lesson
- `title`, `description`
- `type` (PDF, video, code, etc.)
- `url`, `fileName`, `fileSize`, `fileType`
- `isDownloadable`, `downloadCount`

**Instance Methods:**
- `getFileSizeFormatted()` - Returns "2.5 MB" format
- `getFileExtension()` - Returns file extension

### 6. **enrollmentModel.ts** - Student Enrollments
- Tracks student progress in courses
- Manages completion status
- Certificate generation tracking

**Key Fields:**
- `student` → references User
- `course` → references Course
- `progress` (0-100 percentage)
- `completedLessons` → references Lesson[]
- `completedModules` → references Module[]
- `currentLesson`, `currentModule`
- `totalTimeSpent`, `lastAccessedAt`, `completedAt`
- `status` (active, completed, dropped, paused, expired)
- `certificateIssued`, `certificateUrl`
- `amountPaid`, `paymentMethod`, `transactionId`

**Instance Methods:**
- `getTimeSpentFormatted()` - Returns "5h 30m" format
- `getCompletionPercentage()` - Returns progress percentage

### 7. **reviewModel.ts** - Course Reviews
- Student ratings and reviews
- Auto-verifies purchase status
- Updates course rating automatically

**Key Fields:**
- `course` → references Course
- `student` → references User
- `rating` (1-5 stars)
- `title`, `comment`
- `pros`, `cons`
- `helpfulCount`, `reportCount`
- `isVerified` (auto-set based on enrollment)
- `isApproved`, `isFeatured`
- `instructorResponse`

**Instance Methods:**
- `getRatingStars()` - Returns array for star display

**Hooks:**
- Pre-save: Auto-verifies if student is enrolled
- Post-save/delete: Updates course rating and review count

### 8. **quizModel.ts** - Quiz/Assessment
- Quiz configuration and settings
- Links to questions
- Tracks statistics

**Key Fields:**
- `lesson` → references Lesson
- `course` → references Course
- `title`, `description`, `instructions`
- `timeLimit`, `passingScore`, `maxAttempts`
- `shuffleQuestions`, `showCorrectAnswers`
- `questions` → references Question[]
- `totalQuestions`, `totalPoints`
- `attemptCount`, `averageScore`, `passRate`

**Instance Methods:**
- `getTimeLimitFormatted()` - Returns "30m" format
- `getPointsPerQuestion()` - Calculates average points

### 9. **questionModel.ts** - Quiz Questions
- Supports multiple question types
- Media attachments (image, audio)
- Flexible answer formats

**Key Fields:**
- `quiz` → references Quiz
- `questionText`, `questionType`
- `points`, `order`
- `image`, `audio`
- `options` → references Option[]
- `correctAnswer` (Mixed type for flexibility)
- `explanation`

**Question Types:**
- `mcq_single` - Single choice
- `mcq_multiple` - Multiple choice
- `true_false` - True/False
- `fill_blank` - Fill in the blank
- `essay` - Essay type
- `code` - Code questions
- `matching` - Matching questions

### 10. **optionModel.ts** - Answer Options
- Individual answer options for questions
- Marks correct answers

**Key Fields:**
- `question` → references Question
- `optionText`, `isCorrect`, `order`
- `explanation`

**Instance Methods:**
- `getOptionLabel()` - Returns "A", "B", "C", etc.

### 11. **quizAttemptModel.ts** - Quiz Attempts
- Tracks student quiz attempts
- Records scores and time spent
- Enforces max attempts

**Key Fields:**
- `quiz` → references Quiz
- `student` → references User
- `course` → references Course
- `attemptNumber`, `startedAt`, `completedAt`
- `timeSpent`, `answers` → references Answer[]
- `score`, `totalPoints`, `percentage`
- `isPassed`

**Instance Methods:**
- `getTimeSpentFormatted()` - Returns "5m 30s" format
- `getGrade()` - Returns letter grade (A, B, C, D, F)

**Hooks:**
- Post-save: Updates quiz statistics (attempt count, average score, pass rate)

### 12. **answerModel.ts** - Student Answers
- Records individual question answers
- Tracks correctness and points earned

**Key Fields:**
- `quizAttempt` → references QuizAttempt
- `question` → references Question
- `selectedOption` → references Option (for single choice)
- `selectedOptions` → references Option[] (for multiple choice)
- `textAnswer` (for essay/code questions)
- `isCorrect`, `pointsEarned`, `feedback`

## 🔗 Relationships & Data Flow

### Course Creation Flow:
1. Create **Category**
2. Create **Course** (references Category)
3. Create **Module** (references Course)
4. Create **Lesson** (references Module & Course)
5. Optionally create **Resource** (references Lesson)
6. Optionally create **Quiz** (references Lesson & Course)
7. Create **Question** (references Quiz)
8. Create **Option** (references Question)

### Student Enrollment Flow:
1. Create **Enrollment** (references Student & Course)
2. As student progresses, update `completedLessons` and `completedModules`
3. Update `progress` percentage
4. When complete, auto-sets `isCompleted` and `completedAt`

### Quiz Taking Flow:
1. Create **QuizAttempt** (references Quiz, Student, Course)
2. Create **Answer** for each question (references QuizAttempt & Question)
3. On completion, calculate `score`, `percentage`, `isPassed`
4. Auto-updates quiz statistics

### Review Flow:
1. Create **Review** (references Course & Student)
2. Auto-verifies if student is enrolled
3. On save/delete, auto-updates course `rating` and `reviewCount`

## 📊 Database Indexes

All schemas include optimized indexes for common queries:

- **Category**: slug, parentCategory + isActive, isActive + courseCount
- **Course**: slug (unique), category + isPublished + status, primaryInstructor, level, rating + enrollmentCount, featured, tags, text search
- **Module**: course + order, course + isPublished
- **Lesson**: module + order, course + isPublished, module + isPublished
- **Resource**: lesson, type
- **Enrollment**: student + course (unique), course + status, student + status, isCompleted + completedAt
- **Review**: course + isApproved + rating, student + course (unique), isFeatured, rating + helpfulCount
- **Quiz**: lesson, course + isPublished
- **Question**: quiz + order
- **Option**: question + order
- **QuizAttempt**: quiz + student + attemptNumber, student + completedAt, quiz + isPassed
- **Answer**: quizAttempt + question (unique)

## 🚀 Usage Examples

### Import All Models:
```typescript
import { Category, Course, Module, Lesson, Enrollment } from './models';
```

### Import Specific Interfaces:
```typescript
import type { ICourse, ICategory, IEnrollment } from './models';
```

### Import Enums:
```typescript
import { CourseLevel, CourseStatus, LessonContentType } from './models';
```

### Create a Course:
```typescript
const category = await Category.create({ name: 'Web Development', slug: 'web-development' });

const course = await Course.create({
  title: 'Complete React Course',
  slug: 'complete-react-course',
  description: 'Learn React from scratch',
  category: category._id,
  primaryInstructor: instructorId,
  instructors: [instructorId],
  price: 99.99,
  level: CourseLevel.BEGINNER,
  language: 'English',
  thumbnail: 'https://example.com/thumb.jpg',
  isPublished: true,
});
```

### Enroll a Student:
```typescript
const enrollment = await Enrollment.create({
  student: studentId,
  course: courseId,
  amountPaid: 99.99,
  paymentMethod: 'credit_card',
});
```

### Add a Review:
```typescript
const review = await Review.create({
  course: courseId,
  student: studentId,
  rating: 5,
  title: 'Excellent Course!',
  comment: 'Best React course ever',
  pros: ['Great explanations', 'Practical projects'],
  cons: ['Could use more exercises'],
});
// Course rating is automatically updated!
```

### Query with Population:
```typescript
const course = await Course.findById(courseId)
  .populate('category', 'name slug')
  .populate('primaryInstructor', 'name email')
  .populate('instructors', 'name')
  .exec();

// Get course with all modules and lessons
const fullCourse = await Course.findById(courseId)
  .populate({
    path: 'modules',
    populate: {
      path: 'lessons',
      populate: {
        path: 'resources quiz'
      }
    }
  })
  .exec();
```

## 🎯 Key Features

### Auto-Calculated Fields:
- **Course**: `totalModules`, `totalLessons`, `rating`, `reviewCount`, `publishedAt`
- **Module**: `totalLessons`
- **Lesson**: View count, completion count
- **Enrollment**: `isCompleted`, `completedAt`, `lastAccessedAt`
- **Review**: `isVerified`, course `rating` and `reviewCount`
- **Quiz**: `totalQuestions`, `attemptCount`, `averageScore`, `passRate`

### Data Validation:
- Required fields with custom error messages
- Min/max value constraints
- String length limits
- Enum validations
- Custom validators (e.g., discount < price)

### Timestamps:
- All schemas include `createdAt` and `updatedAt`
- `timestamps: true` in schema options

### Security:
- Passwords excluded from JSON output (in User model)
- Sensitive fields can use `select: false`
- Input validation on all fields

## 📝 Notes

- All ObjectId references use Mongoose's `ref` for population
- Enum values are defined in `courseInterfaces.ts`
- Post-save hooks automatically update related documents
- Indexes are optimized for common query patterns
- All schemas follow TypeScript best practices with proper typing

## 🔧 Maintenance

When modifying schemas:
1. Update the interface in `courseInterfaces.ts`
2. Update the schema in the respective model file
3. Update indexes if query patterns change
4. Update this README if adding new features

## 📚 Additional Resources

- [Mongoose Documentation](https://mongoosejs.com/)
- [MongoDB Indexing](https://docs.mongodb.com/manual/indexes/)
- [TypeScript with Mongoose](https://mongoosejs.com/docs/typescript.html)