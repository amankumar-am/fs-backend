const { poolPromise } = require('../config/db');
const sql = require('mssql');

module.exports.getAllMenus = async () => {
    const pool = await poolPromise;
    const records = await pool.request().query('SELECT * FROM MenuMaster');
    return records;
}

module.exports.getAllMenus2 = async (req, res) => {
    const pool = await poolPromise;
    const records = await pool.request()
        .input('user_id', sql.Int, req.user_id)
        .execute('GetUserMenu')
    return records;
}

module.exports.getMenuById = async (id) => {
    const pool = await poolPromise;
    const record = await pool.request()
        .input('id', sql.Int, id)
        .query('SELECT * FROM MenuMaster WHERE MN_Id = @id');
    return record
}

module.exports.addMenuItem = async (menuData) => {
    const pool = await poolPromise;
    try {
        if (!menuData.MN_Name || !menuData.MN_Path) {
            throw new Error('Name and Path are required fields');
        }

        const result = await pool.request()
            .input('Name', sql.VarChar(30), menuData.MN_Name)
            .input('Path', sql.VarChar(30), menuData.MN_Path)
            .input('Icon', sql.VarChar(30), menuData.MN_Icon || null)
            .input('Category', sql.Int, menuData.MN_Category || null)
            .input('CreatedBy', sql.VarChar(30), menuData.CreatedBy || 'system') // Use 'system' as fallback
            .query(`
                INSERT INTO MenuMaster 
                (MN_Name, MN_Path, MN_Icon, MN_Category, MN_CreatedBy)
                OUTPUT INSERTED.MN_Id
                VALUES (@Name, @Path, @Icon, @Category, @CreatedBy)
            `);
        return {
            success: true,
            insertedId: result.recordset[0].MN_Id,
            message: 'Menu item created successfully'
        };
    } catch (error) {
        console.error('Database error in addMenuItem:', error);
        throw error;
    }
};

module.exports.updateMenuItem = async (id, updateData) => {
    const pool = await poolPromise;
    try {
        await pool.request()
            .input('Id', sql.Int, id)
            .input('Name', sql.VarChar(30), updateData.MN_Name)
            .input('Path', sql.VarChar(30), updateData.MN_Path)
            .input('Icon', sql.VarChar(30), updateData.MN_Icon)
            .input('Category', sql.VarChar(30), updateData.MN_Category)
            .input('UpdatedBy', sql.VarChar(30), updateData.UpdatedBy || 'system')
            .query(`
                UPDATE MenuMaster 
                SET 
                    MN_Name = @Name,
                    MN_Path = @Path,
                    MN_Icon = @Icon,
                    MN_Category = @Category,
                    MN_UpdatedBy = @UpdatedBy,
                    MN_UpdatedAt = SYSDATETIME()
                WHERE MN_Id = @Id
            `);

        return { success: true };
    } catch (error) {
        throw error;
    }
};


module.exports.deleteMenuItem = async (id) => {
    const pool = await poolPromise;
    try {
        await pool.request()
            .input('Id', sql.Int, id)
            .query(`
                DELETE FROM MenuMaster
                WHERE MN_Id = @Id
            `);

        return { success: true };
    } catch (error) {
        throw error;
    }
};

