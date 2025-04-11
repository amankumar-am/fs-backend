const { poolPromise } = require('../config/db');
const sql = require('mssql');

module.exports.getAllMenus = async (req, res) => {
    //To get the list of menus. it takes logged in user_id as input and triggers the sp 'GetUserMenu'.
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
    const transaction = new sql.Transaction(pool);
    try {
        await transaction.begin();
        if (!menuData.MN_Name || !menuData.MN_Path) {
            throw new Error('Name and Path are required fields');
        }
        // 1. Insert into MenuMaster
        const menuResult = await new sql.Request(transaction)
            .input('Name', sql.VarChar(100), menuData.MN_Name)
            .input('Path', sql.VarChar(100), menuData.MN_Path)
            .input('Icon', sql.VarChar(100), menuData.MN_Icon || null)
            .input('Category', sql.Int, menuData.MN_Category || null)
            .input('CreatedBy', sql.VarChar(100), menuData.CreatedBy || 'system')
            .query(`
                INSERT INTO MenuMaster 
                (MN_Name, MN_Path, MN_Icon, MN_Category, MN_CreatedBy)
                OUTPUT INSERTED.MN_Id
                VALUES (@Name, @Path, @Icon, @Category, @CreatedBy)
            `);
        const newMenuId = menuResult.recordset[0].MN_Id;

        // 2. Insert into RoleDetails with OUTPUT clause to get the ID
        const roleResult = await new sql.Request(transaction)
            .input('MenuId', sql.Int, newMenuId)
            .input('RoleId', sql.Int, 1)
            .input('CanAdd', sql.Bit, 1)
            .input('CanUpdate', sql.Bit, 1)
            .input('CanView', sql.Bit, 1)
            .input('CanDelete', sql.Bit, 1)
            .query(`
                INSERT INTO RoleDetails 
                (RD_RoleId, RD_MenuId, RD_CanAdd, RD_CanUpdate, RD_CanView, RD_CanDelete)
                OUTPUT INSERTED.RD_Id
                VALUES (@RoleId, @MenuId, @CanAdd, @CanUpdate, @CanView, @CanDelete)
            `);
        const roleDetailsId = roleResult.recordset[0].RD_Id;
        if (!roleDetailsId) {
            throw new Error('Failed to get RoleDetails ID');
        }

        // 3. Insert into UserDetails
        await new sql.Request(transaction)
            .input('UserId', sql.Int, 7)
            .input('RoleDetailId', sql.Int, roleDetailsId)
            .query(`
                INSERT INTO UserDetails 
                (USD_UsmId, USD_RoleDetId)
                VALUES (@UserId, @RoleDetailId)
            `);

        await transaction.commit();
        return {
            success: true,
            insertedId: newMenuId,
            roleDetailsId: roleDetailsId,
            message: 'Menu item created successfully with admin permissions'
        };
    } catch (error) {
        await transaction.rollback();
        console.error('Database error in addMenuItem:', {
            error: error.message,
            stack: error.stack,
            menuData: menuData
        });
        throw new Error(`Failed to create menu item: ${error.message}`);
    }
}


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
    const transaction = new sql.Transaction(pool);
    try {
        await transaction.begin();

        // 1. First delete UserDetails records that reference RoleDetails for this menu
        await new sql.Request(transaction)
            .input('MenuId', sql.Int, id)
            .query(`
                DELETE FROM UserDetails
                WHERE USD_RoleDetId IN (
                    SELECT RD_Id FROM RoleDetails WHERE RD_MenuId = @MenuId
                )
            `);

        // 2. Then delete RoleDetails records for this menu
        await new sql.Request(transaction)
            .input('MenuId', sql.Int, id)
            .query(`
                DELETE FROM RoleDetails 
                WHERE RD_MenuId = @MenuId
            `);

        // 3. Finally delete the menu item itself
        await new sql.Request(transaction)
            .input('Id', sql.Int, id)
            .query(`
                DELETE FROM MenuMaster
                WHERE MN_Id = @Id
            `);

        await transaction.commit();

        return {
            success: true,
            message: 'Menu item and all related permissions deleted successfully'
        };
    } catch (error) {
        await transaction.rollback();
        console.error('Database error in deleteMenuItem:', {
            error: error.message,
            stack: error.stack,
            menuId: id,
            timestamp: new Date().toISOString()
        });
        throw new Error(`Failed to delete menu item: ${error.message}`);
    }
};

module.exports.checkMenuNameExists = async (name) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('name', sql.VarChar, name)
            .query('SELECT MN_Name FROM MenuMaster WHERE MN_Name = @name');

        // Return true if any records found, false otherwise
        return result.recordset.length > 0;
    } catch (error) {
        console.error('Database error:', error);
        throw error;
    }
};
