const bcrypt = require('bcryptjs');
const { User, sequelize } = require('./models');

const seedAdmin = async () => {
    try {
        await sequelize.authenticate();

        const email = 'admin@tilexcare.com';
        const password = 'adminpassword';

        const existingAdmin = await User.findOne({ where: { email } });
        if (existingAdmin) {
            console.log('Admin user already exists');
            return;
        }

        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        await User.create({
            email,
            password_hash,
            role: 'admin',
        });

        console.log(`Admin user created: ${email} / ${password}`);
    } catch (error) {
        console.error('Error seeding admin:', error);
    } finally {
        await sequelize.close();
    }
};

seedAdmin();
