const bcrypt = require('bcrypt');
const saltRounds = 10; // Số vòng salt cho bcrypt
const Users = require('../../Models/user');

module.exports.index = async (req, res) => {
    const user = await Users.find();
    res.json(user);
};

module.exports.user = async (req, res) => {
    const id = req.params.id;
    const user = await Users.findOne({ _id: id });
    res.json(user);
};

module.exports.detail = async (req, res) => {
    const username = req.query.username;
    const password = req.query.password;
    const query = [{ username: username }, { email: username }];
    const user = await Users.findOne({ $or: query });

    if (user === null) {
        res.send("Khong Tìm Thấy User");
    } else {
        // So sánh mật khẩu đã hash với mật khẩu plain text
        const match = await bcrypt.compare(password, user.password);
        if (match) {
            res.json(user);
        } else {
            res.send("Sai Mat Khau");
        }
    }
};

module.exports.post_user = async (req, res) => {
    const user = await Users.findOne({ username: req.body.username });

    if (user) {
        res.send("User Da Ton Tai");
    } else {
        // Hash mật khẩu trước khi tạo user
        const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);
        const newUser = { ...req.body, password: hashedPassword };
        await Users.create(newUser);
    }

    res.send("Thanh Cong");
};

module.exports.update_user = async (req, res) => {
    const user = await Users.findOne({ _id: req.body._id });

    if (!user) {
        res.send("Không tìm thấy user để cập nhật");
        return;
    }

    user.fullname = req.body.fullname;
    user.username = req.body.username;

    // Hash mật khẩu mới nếu có
    if (req.body.password) {
        const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);
        user.password = hashedPassword;
    }

    await user.save();
    res.json("Thanh Cong");
};