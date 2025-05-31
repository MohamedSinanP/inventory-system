import ICustomerRepository from "../interfaces/repositories/customer.repository";
import ICustomerService from "../interfaces/services/customer.service";
import customerRepository from "../repositories/customer.repository";
import { HttpError } from "../utils/http.error";
import { StatusCode, PaginatedData } from "../types/type";
import { customerData, CustomerDTO } from "../types/user";

class CustomerService implements ICustomerService {
  constructor(private _customerRepository: ICustomerRepository) { }

  async addCustomer(data: customerData): Promise<CustomerDTO> {
    if (!data.name || !data.email || !data.address || !data.phoneNumber) {
      throw new HttpError(StatusCode.BAD_REQUEST, "All customer fields are required.");
    }

    const existingCustomer = await this._customerRepository.findOne({ email: data.email });
    if (existingCustomer) {
      throw new HttpError(StatusCode.BAD_REQUEST, "Customer already exists with this email.");
    }

    const newCustomer = await this._customerRepository.addCustomer(data);
    return {
      id: newCustomer._id.toString(),
      userId: newCustomer.userId.toString(),
      name: newCustomer.name,
      email: newCustomer.email,
      address: newCustomer.address,
      phoneNumber: newCustomer.phoneNumber,
    };
  }

  async editCustomer(id: string, data: Partial<customerData>): Promise<CustomerDTO> {
    const { name, email, phoneNumber, address } = data;
    const customer = await this._customerRepository.findById(id);
    if (!customer) {
      throw new HttpError(StatusCode.NOT_FOUND, "Customer not found.");
    }

    const updated = await this._customerRepository.update(id, {
      name,
      email,
      phoneNumber,
      address
    });
    if (!updated) {
      throw new HttpError(StatusCode.INTERNAL_SERVER_ERROR, "Failed to update customer.");
    }

    return {
      id: updated._id.toString(),
      userId: updated.userId.toString(),
      name: updated.name,
      email: updated.email,
      address: updated.address,
      phoneNumber: updated.phoneNumber,
    };
  }

  async getCustomers(userId: string, page: number, limit: number, search: string): Promise<PaginatedData<CustomerDTO>> {

    const { data, total } = await this._customerRepository.findPaginated(userId, page, limit, search);

    const customerDTOs: CustomerDTO[] = data.map((customer) => ({
      id: customer._id.toString(),
      userId: customer.userId.toString(),
      name: customer.name,
      email: customer.email,
      address: customer.address,
      phoneNumber: customer.phoneNumber,
    }));

    return {
      data: customerDTOs,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    };
  }

  async getAllCustomers(userId: string): Promise<CustomerDTO[] | null> {
    const customers = await this._customerRepository.findAll({ userId });
    if (customers) {
      const customerDTOs: CustomerDTO[] = customers.map(customer => ({
        id: customer._id.toString(),
        userId: customer.userId.toString(),
        name: customer.name,
        email: customer.email,
        phoneNumber: customer.phoneNumber,
        address: customer.address
      }));
      return customerDTOs;
    } else {
      return null;
    }
  }
}

export default new CustomerService(customerRepository);