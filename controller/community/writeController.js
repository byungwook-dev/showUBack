import multer from "multer";
import Community from "../../models/community/communitySchema.js";
import Write from "../../models/community/writeSchema.js";
import fs from "fs";
import path from "path";

// 글 임시 저장
const saveToWrite = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "사용자가 인증되지 않았습니다." });
  }

  const { title, category, content, writeFile } = req.body; // writeFile 추가

  if (!title || !category || !content) {
    return res.status(400).json({ message: "모든 필드를 입력해주세요." });
  }

  try {
    const newWrite = new Write({
      userId: req.user._id,
      title,
      category,
      content,
      writeFile, // 첨부 파일 URL 저장
      createdAt: new Date().toISOString(),
    });

    const savedWrite = await newWrite.save();

    res.status(201).json({ message: "임시 저장되었습니다.", post: savedWrite });
  } catch (error) {
    console.error("임시 저장 중 오류:", error);
    res.status(500).json({ message: "서버 오류" });
  }
};



// 모든 임시 저장 글 가져오기
export const getAllWritePosts = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "사용자가 인증되지 않았습니다." });
  }

  try {
    const posts = await Write.find({ userId: req.user._id }).sort({ createdAt: -1 }); // 작성자의 글만 반환
    res.status(200).json(posts);
  } catch (error) {
    console.error("임시 저장 글 가져오기 중 오류:", error);
    res.status(500).json({ message: "임시 저장 글을 가져오는 데 실패했습니다." });
  }
};


// 특정 임시 저장 글 가져오기
export const getWritePostById = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "사용자가 인증되지 않았습니다." });
  }

  const { id } = req.params;

  try {
    const post = await Write.findOne({ _id: id, userId: req.user._id });
    if (!post) {
      return res.status(404).json({ message: "글을 찾을 수 없습니다." });
    }

    res.status(200).json(post);
  } catch (error) {
    console.error("임시 저장 글 가져오기 중 오류:", error);
    res.status(500).json({ message: "글을 가져오는 데 실패했습니다." });
  }
};

// 파일 크기 제한
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// multer 설정
const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, 'uploads/'); // 파일 저장 경로
  },
  filename: (req, file, callback) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    callback(null, `${uniqueSuffix}-${file.originalname}`);
  },
});

// 파일 필터 (이미지 파일만 허용)
const fileFilter = (req, file, callback) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
  if (allowedTypes.includes(file.mimetype)) {
    callback(null, true); // 허용된 파일
  } else {
    callback(new Error('이미지 파일만 업로드 가능합니다.')); // 에러 처리
  }
};
const uploadPath = path.resolve("uploads");

if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath);
}

// multer 업로드
const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE }, // 파일 크기 제한
  fileFilter,
});

// 파일 업로드
const uploadFile = (req, res) => {
  const uploadMiddleware = upload.single("file");

  uploadMiddleware(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({ message: "첨부 파일은 최대 5MB까지 등록할 수 있습니다." });
      }
      return res.status(400).json({ message: err.message });
    } else if (err) {
      return res.status(400).json({ message: "파일 업로드에 실패했습니다." });
    }

    if (!req.file) {
      return res.status(400).json({ message: "파일이 업로드되지 않았습니다." });
    }

    const fileUrl = `/uploads/${req.file.filename}`;
    res.status(200).json({ url: fileUrl });
  });
};
  

  

// 커뮤니티 글 작성
// const createCommunityPost = async (req, res) => {
//   if (!req.user) {
//     return res.status(401).json({ message: "사용자가 인증되지 않았습니다." });
//   }

//   const { title, category  } = req.body;

//   if (!title || !category ) {
//     return res.status(400).json({ message: "모든 필드를 입력해주세요." });
//   }

//   try {
//     const newPost = new Community({
//       userId: req.user._id, // 인증된 사용자 ID
//       title,
//       category,
//     });

//     await newPost.save();
//     res.status(201).json({ message: "게시글이 작성되었습니다.", post: newPost });
//   } catch (error) {
//     console.error("게시글 작성 중 오류:", error);
//     res.status(500).json({ message: "서버 오류" });
//   }
// };



// communityController.js
const createCommunityPost = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "사용자가 인증되지 않았습니다." });
  }

  const { title, category, content } = req.body;

  if (!title || !category || !content) {
    return res.status(400).json({ message: "모든 필드를 입력해주세요." });
  }

  try {
    const newPost = new Community({
      userId: req.user._id, // 인증된 사용자 ID
      title,
      category,
      content,
      createdAt: new Date().toISOString(),
    });

    await newPost.save();

    res.status(201).json({ message: "게시글이 작성되었습니다.", post: newPost });
  } catch (error) {
    console.error("게시글 작성 중 오류:", error);
    res.status(500).json({ message: "서버 오류" });
  }
};




// 모든 커뮤니티 글 가져오기
// const getAllCommunityPosts = async (req, res) => {
//   try {
//     const posts = await Community.find().sort({ createdAt: -1 }); // 최신순으로 정렬
//     res.status(200).json(posts);
//   } catch (error) {
//     console.error('커뮤니티 글 가져오기 중 오류:', error);
//     res.status(500).json({ message: '커뮤니티 데이터를 가져오는 데 실패했습니다.' });
//   }
// };

const getAllCommunityPosts = async (req, res) => {
  try {
    const posts = await Community.find().sort({ createdAt: -1 }); // 최신순으로 정렬
    res.status(200).json(posts); // 작성된 모든 글 반환
  } catch (error) {
    console.error("커뮤니티 글 가져오기 중 오류:", error);
    res.status(500).json({ message: "커뮤니티 데이터를 가져오는 데 실패했습니다." });
  }
};






export { createCommunityPost, getAllCommunityPosts, uploadFile,saveToWrite };
